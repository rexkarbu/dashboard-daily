export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Location {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface AgendaItem {
  id: string;
  date: string; // YYYY-MM-DD local
  title: string;
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  seriesId: string;
  date: string; // YYYY-MM-DD local
  title: string;
  completed: boolean;
  carryOver: boolean;
  carriedFromId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickNote {
  text: string;
  updatedAt: string;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbabilityMax: number;
  locationName: string;
}

export interface WeatherCache {
  locationId: number;
  fetchedAt: string;
  data: WeatherData;
}

export interface AppSettings {
  corner: Corner;
  margin: number;
  alwaysOnTop: boolean;
  launchAtLogin: boolean;
  location: Location | null;
  windowBounds?: WindowBounds | null;
}

export interface AppData {
  schemaVersion: 1;
  settings: AppSettings;
  agenda: AgendaItem[];
  todos: TodoItem[];
  quickNote: QuickNote;
  weatherCache: WeatherCache | null;
  meta: {
    lastRolloverDate: string | null;
  };
}

export type WeatherResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: WeatherData; isCached: boolean; fetchedAt: string }
  | { status: 'error'; message: string; fallbackData?: WeatherData; fetchedAt?: string };

export interface AppSnapshot {
  data: AppData;
  today: string;
  weather: WeatherResult;
  isPackaged: boolean;
  systemNotice?: string | null;
}

export interface CreateAgendaInput {
  date: string;
  title: string;
  startTime: string;
  endTime?: string;
  notes?: string;
}

export interface UpdateAgendaInput {
  id: string;
  date: string;
  title: string;
  startTime: string;
  endTime?: string;
  notes?: string;
}

export interface CreateTodoInput {
  date?: string;
  title: string;
  carryOver?: boolean;
}

export interface UpdateTodoInput {
  id: string;
  title: string;
  carryOver: boolean;
}

export interface UpdateSettingsInput {
  corner?: Corner;
  margin?: number;
  alwaysOnTop?: boolean;
  launchAtLogin?: boolean;
  location?: Location | null;
  windowBounds?: WindowBounds | null;
}

export interface DashboardAPI {
  getBootstrapData(): Promise<AppSnapshot>;
  agenda: {
    create(input: CreateAgendaInput): Promise<AppSnapshot>;
    update(input: UpdateAgendaInput): Promise<AppSnapshot>;
    remove(id: string): Promise<AppSnapshot>;
  };
  todos: {
    create(input: CreateTodoInput): Promise<AppSnapshot>;
    update(input: UpdateTodoInput): Promise<AppSnapshot>;
    toggle(id: string): Promise<AppSnapshot>;
    remove(id: string): Promise<AppSnapshot>;
  };
  notes: {
    save(text: string): Promise<AppSnapshot>;
  };
  weather: {
    searchLocations(query: string): Promise<Location[]>;
    refresh(force?: boolean): Promise<WeatherResult>;
  };
  settings: {
    update(input: UpdateSettingsInput): Promise<AppSnapshot>;
  };
  window: {
    hide(): Promise<void>;
  };
  onStateChanged(callback: (snapshot: AppSnapshot) => void): () => void;
}
