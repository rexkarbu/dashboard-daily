import { BrowserWindow, screen, shell } from 'electron';
import { AppSettings } from '../../shared/contracts';
import { WINDOW_CONFIG } from '../../shared/defaults';
import { repositionDashboardWindow } from './window-position';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export function createDashboardWindow(settings: AppSettings): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: WINDOW_CONFIG.width,
    height: WINDOW_CONFIG.height,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
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
  repositionDashboardWindow(mainWindow, settings.corner, settings.margin);

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
    repositionDashboardWindow(mainWindow, settings.corner, settings.margin);
    mainWindow.show();
  });

  // Auto reposition on display/workArea changes
  const onDisplayChange = () => {
    if (!mainWindow.isDestroyed()) {
      repositionDashboardWindow(mainWindow, settings.corner, settings.margin);
    }
  };

  screen.on('display-metrics-changed', onDisplayChange);
  screen.on('display-added', onDisplayChange);
  screen.on('display-removed', onDisplayChange);

  mainWindow.on('closed', () => {
    screen.removeListener('display-metrics-changed', onDisplayChange);
    screen.removeListener('display-added', onDisplayChange);
    screen.removeListener('display-removed', onDisplayChange);
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  return mainWindow;
}
