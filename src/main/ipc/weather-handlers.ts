import { LocationService } from '../services/location-service';
import { WeatherService } from '../services/weather-service';
import { Location, WeatherResult } from '../../shared/contracts';
import { AppError } from '../utils/app-error';

export async function handleWeatherSearch(
  locationService: LocationService,
  query: unknown
): Promise<Location[]> {
  if (typeof query !== 'string') {
    throw new AppError('Query pencarian lokasi tidak valid');
  }

  return locationService.searchLocations(query);
}

export async function handleWeatherRefresh(
  weatherService: WeatherService,
  force?: unknown
): Promise<WeatherResult> {
  const isForce = typeof force === 'boolean' ? force : false;
  return weatherService.getWeather(isForce);
}
