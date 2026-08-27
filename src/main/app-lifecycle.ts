import { app, BrowserWindow, powerMonitor } from 'electron';
import { JsonStore } from './services/json-store';
import { WeatherService } from './services/weather-service';
import { LocationService } from './services/location-service';
import { AutoStartService } from './services/auto-start-service';
import { DailyRolloverService } from './services/daily-rollover-service';
import { createDashboardWindow } from './window/create-dashboard-window';
import { createTray, updateTrayMenu, TrayCallbacks } from './tray/create-tray';
import { registerIpcHandlers, broadcastStateChange, buildSnapshot } from './ipc/register-ipc-handlers';
import { applyWindowBounds } from './window/window-position';
import { AppSettings, WindowBounds } from '../shared/contracts';

export class AppLifecycle {
  private mainWindow: BrowserWindow | null = null;
  private jsonStore: JsonStore;
  private weatherService: WeatherService;
  private locationService: LocationService;
  private autoStartService: AutoStartService;
  private rolloverService: DailyRolloverService;
  private isQuitting = false;

  constructor() {
    this.jsonStore = new JsonStore();
    this.weatherService = new WeatherService(this.jsonStore);
    this.locationService = new LocationService();
    this.autoStartService = new AutoStartService();
    this.rolloverService = new DailyRolloverService(this.jsonStore);
  }

  public async start(): Promise<void> {
    const gotLock = app.requestSingleInstanceLock();
    if (!gotLock) {
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore();
        }
        if (!this.mainWindow.isVisible()) {
          this.mainWindow.show();
        }
        this.mainWindow.focus();
      }
    });

    await app.whenReady();

    // 1. Initialize local data
    const appData = await this.jsonStore.init();

    // 2. Perform daily rollover check
    await this.rolloverService.performRolloverIfNeeded();

    // 3. Create dashboard window
    this.mainWindow = createDashboardWindow(appData.settings, async (bounds) => {
      await this.jsonStore.update((curr) => ({
        ...curr,
        settings: {
          ...curr.settings,
          windowBounds: bounds,
        },
      }));
    });

    // Prevent closing window from destroying app, hide to tray instead
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });

    // 4. Setup Tray callbacks
    const trayCallbacks: TrayCallbacks = {
      onToggleWindow: () => {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide();
        } else {
          // Do not reposition automatically on show
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      },
      onRefreshWeather: async () => {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
        await this.weatherService.getWeather(true);
        const snap = await buildSnapshot(this.jsonStore, this.weatherService);
        broadcastStateChange(this.mainWindow, snap);
      },
      onUpdateSettings: async (newSettings: Partial<AppSettings>) => {
        let clearedBounds: WindowBounds | null | undefined = undefined;
        // If user actively changes corner/margin, clear saved bounds so it snaps to the new corner
        if (newSettings.corner !== undefined || newSettings.margin !== undefined) {
          clearedBounds = null;
        }

        const updated = await this.jsonStore.update((curr) => ({
          ...curr,
          settings: {
            ...curr.settings,
            ...newSettings,
            ...(clearedBounds !== undefined ? { windowBounds: clearedBounds } : {}),
          },
        }));

        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          if (newSettings.alwaysOnTop !== undefined) {
            this.mainWindow.setAlwaysOnTop(newSettings.alwaysOnTop);
          }
          if (newSettings.corner !== undefined || newSettings.margin !== undefined || newSettings.windowBounds === null) {
            applyWindowBounds(
              this.mainWindow,
              updated.settings.windowBounds,
              updated.settings.corner,
              updated.settings.margin
            );
          }
          if (newSettings.launchAtLogin !== undefined) {
            this.autoStartService.applyAutoStart(newSettings.launchAtLogin);
          }

          const snap = await buildSnapshot(this.jsonStore, this.weatherService);
          broadcastStateChange(this.mainWindow, snap);
          updateTrayMenu(this.mainWindow, snap.data.settings, trayCallbacks);
        }
      },
      onQuit: () => {
        this.isQuitting = true;
        app.quit();
      },
    };

    // 5. Create System Tray
    createTray(this.mainWindow, appData.settings, trayCallbacks);

    // 6. Register IPC Handlers
    registerIpcHandlers(
      this.mainWindow,
      this.jsonStore,
      this.weatherService,
      this.locationService,
      this.autoStartService,
      trayCallbacks
    );

    // 7. Setup Background services & event listeners
    this.rolloverService.setOnStateChange(async () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const snap = await buildSnapshot(this.jsonStore, this.weatherService);
        broadcastStateChange(this.mainWindow, snap);
      }
    });
    this.rolloverService.startPeriodicCheck(60000);

    this.weatherService.startPeriodicRefresh(async () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const snap = await buildSnapshot(this.jsonStore, this.weatherService);
        broadcastStateChange(this.mainWindow, snap);
      }
    });

    // Check on OS resume from sleep
    powerMonitor.on('resume', async () => {
      await this.rolloverService.performRolloverIfNeeded();
      await this.weatherService.getWeather(false);
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const snap = await buildSnapshot(this.jsonStore, this.weatherService);
        broadcastStateChange(this.mainWindow, snap);
      }
    });

    // On window show, verify rollover & check weather if needed
    this.mainWindow.on('show', async () => {
      await this.rolloverService.performRolloverIfNeeded();
    });

    // Handle macOS activate
    app.on('activate', () => {
      if (this.mainWindow) {
        if (!this.mainWindow.isVisible()) {
          this.mainWindow.show();
        }
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
      this.rolloverService.stop();
      this.weatherService.stop();
    });
  }
}
