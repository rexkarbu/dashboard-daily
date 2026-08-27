import { ipcMain, BrowserWindow, app } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { AppSnapshot } from '../../shared/contracts';
import { JsonStore } from '../services/json-store';
import { WeatherService } from '../services/weather-service';
import { LocationService } from '../services/location-service';
import { AutoStartService } from '../services/auto-start-service';
import { TrayCallbacks } from '../tray/create-tray';
import { getLocalDateKey } from '../utils/local-date';
import { handleAgendaCreate, handleAgendaUpdate, handleAgendaRemove } from './agenda-handlers';
import { handleTodoCreate, handleTodoUpdate, handleTodoToggle, handleTodoRemove } from './todo-handlers';
import { handleNoteSave } from './note-handlers';
import { handleWeatherSearch, handleWeatherRefresh } from './weather-handlers';
import { handleSettingsUpdate } from './settings-handlers';

export async function buildSnapshot(
  jsonStore: JsonStore,
  weatherService: WeatherService
): Promise<AppSnapshot> {
  const data = await jsonStore.getData();
  const today = getLocalDateKey(new Date());
  const weather = await weatherService.getWeather(false);

  return {
    data,
    today,
    weather,
    isPackaged: app.isPackaged,
    systemNotice: jsonStore.getSystemNotice(),
  };
}

export function broadcastStateChange(window: BrowserWindow, snapshot: AppSnapshot): void {
  if (window && !window.isDestroyed()) {
    window.webContents.send(IPC_CHANNELS.STATE_CHANGED, snapshot);
  }
}

export function registerIpcHandlers(
  window: BrowserWindow,
  jsonStore: JsonStore,
  weatherService: WeatherService,
  locationService: LocationService,
  autoStartService: AutoStartService,
  trayCallbacks: TrayCallbacks
): void {
  const snapshot = () => buildSnapshot(jsonStore, weatherService);

  // Remove existing handlers if re-registering
  Object.values(IPC_CHANNELS).forEach((channel) => {
    ipcMain.removeHandler(channel);
  });

  ipcMain.handle(IPC_CHANNELS.GET_BOOTSTRAP, async () => {
    return snapshot();
  });

  // Agenda
  ipcMain.handle(IPC_CHANNELS.AGENDA_CREATE, async (_, payload) => {
    await handleAgendaCreate(jsonStore, payload);
    const snap = await snapshot();
    broadcastStateChange(window, snap);
    return snap;
  });

  ipcMain.handle(IPC_CHANNELS.AGENDA_UPDATE, async (_, payload) => {
    await handleAgendaUpdate(jsonStore, payload);
    const snap = await snapshot();
    broadcastStateChange(window, snap);
    return snap;
  });

  ipcMain.handle(IPC_CHANNELS.AGENDA_REMOVE, async (_, id) => {
    await handleAgendaRemove(jsonStore, id);
    const snap = await snapshot();
    broadcastStateChange(window, snap);
    return snap;
  });

  // Todos
  ipcMain.handle(IPC_CHANNELS.TODO_CREATE, async (_, payload) => {
    await handleTodoCreate(jsonStore, payload);
    const snap = await snapshot();
    broadcastStateChange(window, snap);
    return snap;
  });

  ipcMain.handle(IPC_CHANNELS.TODO_UPDATE, async (_, payload) => {
    await handleTodoUpdate(jsonStore, payload);
    const snap = await snapshot();
    broadcastStateChange(window, snap);
    return snap;
  });

  ipcMain.handle(IPC_CHANNELS.TODO_TOGGLE, async (_, id) => {
    await handleTodoToggle(jsonStore, id);
    const snap = await snapshot();
    broadcastStateChange(window, snap);
    return snap;
  });

  ipcMain.handle(IPC_CHANNELS.TODO_REMOVE, async (_, id) => {
    await handleTodoRemove(jsonStore, id);
    const snap = await snapshot();
    broadcastStateChange(window, snap);
    return snap;
  });

  // Note
  ipcMain.handle(IPC_CHANNELS.NOTE_SAVE, async (_, payload) => {
    await handleNoteSave(jsonStore, payload);
    const snap = await snapshot();
    broadcastStateChange(window, snap);
    return snap;
  });

  // Weather
  ipcMain.handle(IPC_CHANNELS.WEATHER_SEARCH, async (_, query) => {
    return handleWeatherSearch(locationService, query);
  });

  ipcMain.handle(IPC_CHANNELS.WEATHER_REFRESH, async (_, force) => {
    return handleWeatherRefresh(weatherService, force);
  });

  // Settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, async (_, payload) => {
    await handleSettingsUpdate(jsonStore, autoStartService, window, trayCallbacks, payload);
    const snap = await snapshot();
    broadcastStateChange(window, snap);
    return snap;
  });

  // Window
  ipcMain.handle(IPC_CHANNELS.WINDOW_HIDE, async () => {
    if (window && !window.isDestroyed()) {
      window.hide();
    }
  });
}
