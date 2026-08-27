import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import {
  AppSnapshot,
  CreateAgendaInput,
  UpdateAgendaInput,
  CreateTodoInput,
  UpdateTodoInput,
  UpdateSettingsInput,
  Location,
  WeatherResult,
  DashboardAPI,
} from '../shared/contracts';

const api: DashboardAPI = {
  getBootstrapData: (): Promise<AppSnapshot> => {
    return ipcRenderer.invoke(IPC_CHANNELS.GET_BOOTSTRAP);
  },
  agenda: {
    create: (input: CreateAgendaInput): Promise<AppSnapshot> => {
      return ipcRenderer.invoke(IPC_CHANNELS.AGENDA_CREATE, input);
    },
    update: (input: UpdateAgendaInput): Promise<AppSnapshot> => {
      return ipcRenderer.invoke(IPC_CHANNELS.AGENDA_UPDATE, input);
    },
    remove: (id: string): Promise<AppSnapshot> => {
      return ipcRenderer.invoke(IPC_CHANNELS.AGENDA_REMOVE, id);
    },
  },
  todos: {
    create: (input: CreateTodoInput): Promise<AppSnapshot> => {
      return ipcRenderer.invoke(IPC_CHANNELS.TODO_CREATE, input);
    },
    update: (input: UpdateTodoInput): Promise<AppSnapshot> => {
      return ipcRenderer.invoke(IPC_CHANNELS.TODO_UPDATE, input);
    },
    toggle: (id: string): Promise<AppSnapshot> => {
      return ipcRenderer.invoke(IPC_CHANNELS.TODO_TOGGLE, id);
    },
    remove: (id: string): Promise<AppSnapshot> => {
      return ipcRenderer.invoke(IPC_CHANNELS.TODO_REMOVE, id);
    },
  },
  notes: {
    save: (text: string): Promise<AppSnapshot> => {
      return ipcRenderer.invoke(IPC_CHANNELS.NOTE_SAVE, { text });
    },
  },
  weather: {
    searchLocations: (query: string): Promise<Location[]> => {
      return ipcRenderer.invoke(IPC_CHANNELS.WEATHER_SEARCH, query);
    },
    refresh: (force?: boolean): Promise<WeatherResult> => {
      return ipcRenderer.invoke(IPC_CHANNELS.WEATHER_REFRESH, force);
    },
  },
  settings: {
    update: (input: UpdateSettingsInput): Promise<AppSnapshot> => {
      return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, input);
    },
  },
  window: {
    hide: (): Promise<void> => {
      return ipcRenderer.invoke(IPC_CHANNELS.WINDOW_HIDE);
    },
  },
  onStateChanged: (callback: (snapshot: AppSnapshot) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, snapshot: AppSnapshot) => {
      callback(snapshot);
    };
    ipcRenderer.on(IPC_CHANNELS.STATE_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.STATE_CHANGED, handler);
    };
  },
};

contextBridge.exposeInMainWorld('dashboardAPI', api);
