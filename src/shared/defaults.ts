import { AppData, AppSettings } from './contracts';

export const DEFAULT_SETTINGS: AppSettings = {
  corner: 'top-right',
  margin: 16,
  alwaysOnTop: true,
  launchAtLogin: true,
  location: null,
  windowBounds: null,
};

export const DEFAULT_APP_DATA: AppData = {
  schemaVersion: 1,
  settings: DEFAULT_SETTINGS,
  agenda: [],
  todos: [],
  quickNote: {
    text: '',
    updatedAt: '',
  },
  weatherCache: null,
  meta: {
    lastRolloverDate: null,
  },
};

export const WINDOW_CONFIG = {
  width: 390,
  height: 640,
  minWidth: 360,
  minHeight: 480,
  defaultMargin: 16,
  minMargin: 0,
  maxMargin: 64,
} as const;
