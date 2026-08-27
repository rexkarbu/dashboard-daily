import { BrowserWindow, screen, shell } from 'electron';
import { AppSettings } from '../../shared/contracts';
import { WINDOW_CONFIG } from '../../shared/defaults';
import { applyWindowBounds } from './window-position';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export function createDashboardWindow(
  settings: AppSettings,
  onBoundsChange?: (bounds: { x: number; y: number; width: number; height: number }) => void
): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: WINDOW_CONFIG.width,
    height: WINDOW_CONFIG.height,
    minWidth: WINDOW_CONFIG.minWidth,
    minHeight: WINDOW_CONFIG.minHeight,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: true,
    movable: true,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Position the window initially before showing
  applyWindowBounds(
    mainWindow,
    settings.windowBounds,
    settings.corner,
    settings.margin,
    WINDOW_CONFIG.width,
    WINDOW_CONFIG.height,
    WINDOW_CONFIG.minWidth,
    WINDOW_CONFIG.minHeight
  );

  // Security: Deny window creation / popups
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Security: Block external navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== MAIN_WINDOW_WEBPACK_ENTRY && !url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Show gracefully when rendered to avoid white flash
  mainWindow.once('ready-to-show', () => {
    applyWindowBounds(
      mainWindow,
      settings.windowBounds,
      settings.corner,
      settings.margin,
      WINDOW_CONFIG.width,
      WINDOW_CONFIG.height,
      WINDOW_CONFIG.minWidth,
      WINDOW_CONFIG.minHeight
    );
    mainWindow.show();
  });

  // Only auto-reposition on display changes if we don't have saved bounds,
  // or we need to ensure bounds are valid on new display metrics.
  // We can just call applyWindowBounds with the LATEST bounds (which might be the ones we just moved to).
  let currentBounds = settings.windowBounds;

  const onDisplayChange = () => {
    if (!mainWindow.isDestroyed()) {
      applyWindowBounds(
        mainWindow,
        currentBounds,
        settings.corner,
        settings.margin,
        WINDOW_CONFIG.width,
        WINDOW_CONFIG.height,
        WINDOW_CONFIG.minWidth,
        WINDOW_CONFIG.minHeight
      );
    }
  };

  screen.on('display-metrics-changed', onDisplayChange);
  screen.on('display-added', onDisplayChange);
  screen.on('display-removed', onDisplayChange);

  // Handle bounds change
  let boundsTimeout: NodeJS.Timeout | null = null;

  const handleBoundsChange = () => {
    if (mainWindow.isDestroyed()) return;
    if (mainWindow.isMaximized() || mainWindow.isMinimized()) return;

    const bounds = mainWindow.getNormalBounds();
    currentBounds = bounds;

    if (boundsTimeout) clearTimeout(boundsTimeout);
    boundsTimeout = setTimeout(() => {
      if (onBoundsChange) onBoundsChange(bounds);
    }, 300);
  };

  mainWindow.on('move', handleBoundsChange);
  mainWindow.on('resize', handleBoundsChange);

  mainWindow.on('closed', () => {
    screen.removeListener('display-metrics-changed', onDisplayChange);
    screen.removeListener('display-added', onDisplayChange);
    screen.removeListener('display-removed', onDisplayChange);
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  return mainWindow;
}
