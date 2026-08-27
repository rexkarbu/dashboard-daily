import * as path from 'path';
import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';
import { AppSettings } from '../../shared/contracts';

export interface TrayCallbacks {
  onToggleWindow: () => void;
  onRefreshWeather: () => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onQuit: () => void;
}

let trayInstance: Tray | null = null;

export function createTray(
  window: BrowserWindow,
  currentSettings: AppSettings,
  callbacks: TrayCallbacks
): Tray {
  if (trayInstance) {
    trayInstance.destroy();
  }

  // Load tray icon
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'icons', 'tray-icon.png')
    : path.join(app.getAppPath(), 'assets', 'icons', 'tray-icon.png');

  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    // Fallback if file not found at relative path
    console.error(`[Tray] Failed to load tray icon at ${iconPath}`);
    icon = nativeImage.createEmpty();
  }

  const tray = new Tray(icon);
  tray.setToolTip('Dashboard Daily');

  const buildMenu = (settings: AppSettings): Menu => {
    return Menu.buildFromTemplate([
      {
        label: window.isVisible() ? 'Sembunyikan Dashboard' : 'Tampilkan Dashboard',
        click: () => callbacks.onToggleWindow(),
      },
      {
        label: 'Segarkan Cuaca',
        click: () => callbacks.onRefreshWeather(),
      },
      { type: 'separator' },
      {
        label: 'Selalu di Atas',
        type: 'checkbox',
        checked: settings.alwaysOnTop,
        click: (menuItem) => {
          callbacks.onUpdateSettings({ alwaysOnTop: menuItem.checked });
        },
      },
      {
        label: 'Jalankan saat Login',
        type: 'checkbox',
        checked: settings.launchAtLogin,
        click: (menuItem) => {
          callbacks.onUpdateSettings({ launchAtLogin: menuItem.checked });
        },
      },
      { type: 'separator' },
      {
        label: 'Posisi Widget',
        submenu: [
          {
            label: 'Kiri Atas',
            type: 'radio',
            checked: settings.corner === 'top-left',
            click: () => callbacks.onUpdateSettings({ corner: 'top-left' }),
          },
          {
            label: 'Kanan Atas',
            type: 'radio',
            checked: settings.corner === 'top-right',
            click: () => callbacks.onUpdateSettings({ corner: 'top-right' }),
          },
          {
            label: 'Kiri Bawah',
            type: 'radio',
            checked: settings.corner === 'bottom-left',
            click: () => callbacks.onUpdateSettings({ corner: 'bottom-left' }),
          },
          {
            label: 'Kanan Bawah',
            type: 'radio',
            checked: settings.corner === 'bottom-right',
            click: () => callbacks.onUpdateSettings({ corner: 'bottom-right' }),
          },
        ],
      },
      { type: 'separator' },
      {
        label: 'Keluar',
        click: () => callbacks.onQuit(),
      },
    ]);
  };

  tray.setContextMenu(buildMenu(currentSettings));

  tray.on('click', () => {
    callbacks.onToggleWindow();
  });

  trayInstance = tray;
  return tray;
}

export function updateTrayMenu(
  window: BrowserWindow,
  currentSettings: AppSettings,
  callbacks: TrayCallbacks
): void {
  if (!trayInstance || trayInstance.isDestroyed()) return;

  const menu = Menu.buildFromTemplate([
    {
      label: window.isVisible() ? 'Sembunyikan Dashboard' : 'Tampilkan Dashboard',
      click: () => callbacks.onToggleWindow(),
    },
    {
      label: 'Segarkan Cuaca',
      click: () => callbacks.onRefreshWeather(),
    },
    { type: 'separator' },
    {
      label: 'Selalu di Atas',
      type: 'checkbox',
      checked: currentSettings.alwaysOnTop,
      click: (menuItem) => {
        callbacks.onUpdateSettings({ alwaysOnTop: menuItem.checked });
      },
    },
    {
      label: 'Jalankan saat Login',
      type: 'checkbox',
      checked: currentSettings.launchAtLogin,
      click: (menuItem) => {
        callbacks.onUpdateSettings({ launchAtLogin: menuItem.checked });
      },
    },
    { type: 'separator' },
    {
      label: 'Posisi Widget',
      submenu: [
        {
          label: 'Kiri Atas',
          type: 'radio',
          checked: currentSettings.corner === 'top-left',
          click: () => callbacks.onUpdateSettings({ corner: 'top-left' }),
        },
        {
          label: 'Kanan Atas',
          type: 'radio',
          checked: currentSettings.corner === 'top-right',
          click: () => callbacks.onUpdateSettings({ corner: 'top-right' }),
        },
        {
          label: 'Kiri Bawah',
          type: 'radio',
          checked: currentSettings.corner === 'bottom-left',
          click: () => callbacks.onUpdateSettings({ corner: 'bottom-left' }),
        },
        {
          label: 'Kanan Bawah',
          type: 'radio',
          checked: currentSettings.corner === 'bottom-right',
          click: () => callbacks.onUpdateSettings({ corner: 'bottom-right' }),
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'Keluar',
      click: () => callbacks.onQuit(),
    },
  ]);

  trayInstance.setContextMenu(menu);
}
