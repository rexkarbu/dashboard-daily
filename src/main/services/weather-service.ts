import { JsonStore } from './json-store';
import { Location, WeatherData, WeatherResult } from '../../shared/contracts';
import { weatherDataSchema } from '../../shared/schemas';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    is_day?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    weather_code?: number[];
  };
}

export class WeatherService {
  private readonly jsonStore: JsonStore;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(jsonStore: JsonStore) {
    this.jsonStore = jsonStore;
  }

  public async getWeather(force = false): Promise<WeatherResult> {
    const data = await this.jsonStore.getData();
    const location = data.settings.location;

    if (!location) {
      return { status: 'idle' };
    }

    const cache = data.weatherCache;
    const now = Date.now();

    // Check if valid cache exists for current location
    if (
      !force &&
      cache &&
      cache.locationId === location.id &&
      now - new Date(cache.fetchedAt).getTime() < CACHE_TTL_MS
    ) {
      return {
        status: 'ready',
        data: cache.data,
        isCached: true,
        fetchedAt: cache.fetchedAt,
      };
    }

    // Fetch fresh weather
    try {
      const freshData = await this.fetchForecast(location);
      const nowIso = new Date().toISOString();

      await this.jsonStore.update((curr) => ({
        ...curr,
        weatherCache: {
          locationId: location.id,
          fetchedAt: nowIso,
          data: freshData,
        },
      }));

      return {
        status: 'ready',
        data: freshData,
        isCached: false,
        fetchedAt: nowIso,
      };
    } catch (err) {
      // If error occurs but cache exists for this location, return fallback
      if (cache && cache.locationId === location.id) {
        return {
          status: 'error',
          message: 'Gagal memperbarui cuaca terbaru. Menampilkan data tersimpan.',
          fallbackData: cache.data,
          fetchedAt: cache.fetchedAt,
        };
      }

      return {
        status: 'error',
        message: 'Cuaca belum dapat dimuat. Periksa koneksi internet Anda.',
      };
    }
  }

  public async fetchForecast(location: Location): Promise<WeatherData> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${
      location.longitude
    }&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm`;

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Server cuaca merespon dengan status ${res.status}`);
      }

      const json = (await res.json()) as OpenMeteoResponse;
      const current = json.current;
      const daily = json.daily;

      if (!current) {
        throw new Error('Data cuaca saat ini tidak ditemukan');
      }

      const weatherObj: WeatherData = {
        temperature: Math.round((current.temperature_2m ?? 0) * 10) / 10,
        apparentTemperature: Math.round((current.apparent_temperature ?? 0) * 10) / 10,
        relativeHumidity: current.relative_humidity_2m ?? 0,
        isDay: current.is_day ?? 1,
        precipitation: current.precipitation ?? 0,
        weatherCode: current.weather_code ?? 0,
        windSpeed: current.wind_speed_10m ?? 0,
        temperatureMax: daily?.temperature_2m_max?.[0] ?? current.temperature_2m ?? 0,
        temperatureMin: daily?.temperature_2m_min?.[0] ?? current.temperature_2m ?? 0,
        precipitationProbabilityMax: daily?.precipitation_probability_max?.[0] ?? 0,
        locationName: `${location.name}${location.admin1 ? ', ' + location.admin1 : ''}`,
      };

      const parsed = weatherDataSchema.safeParse(weatherObj);
      if (!parsed.success) {
        throw new Error('Format data cuaca tidak sesuai');
      }

      return parsed.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  public startPeriodicRefresh(onRefreshed?: (res: WeatherResult) => void): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Refresh every 30 minutes
    this.refreshTimer = setInterval(async () => {
      try {
        const result = await this.getWeather(true);
        if (onRefreshed) {
          onRefreshed(result);
        }
      } catch {
        // Silently handle background refresh failure
      }
    }, 30 * 60 * 1000);
  }

  public stop(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
