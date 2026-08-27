import React from 'react';
import {
  MapPin,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  RefreshCw,
} from 'lucide-react';
import { Location, WeatherResult, WeatherData } from '../../../shared/contracts';
import { getWeatherCodeInfo } from './weather-code';
import { ErrorMessage } from '../../components/ErrorMessage';
import { IconButton } from '../../components/IconButton';
import { getLocalTimeString } from '../../../main/utils/local-date';

interface WeatherCardProps {
  location: Location | null;
  weather: WeatherResult;
  onOpenLocationPicker: () => void;
  onRefreshWeather: () => void;
  isRefreshing?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  location,
  weather,
  onOpenLocationPicker,
  onRefreshWeather,
  isRefreshing = false,
}) => {
  if (!location) {
    return (
      <div className="weather-card" style={{ alignItems: 'center', textAlign: 'center', padding: '18px 12px' }}>
        <MapPin size={24} color="var(--accent)" />
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
          Lokasi cuaca belum diatur
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Pilih lokasi Anda untuk melihat cuaca hari ini.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenLocationPicker}
          style={{ fontSize: '12px', padding: '4px 12px' }}
        >
          Atur Lokasi
        </button>
      </div>
    );
  }

  let weatherData: WeatherData | null = null;
  let isCached = false;
  let fetchedAt: string | undefined;
  let errorMessage: string | null = null;

  if (weather.status === 'ready') {
    weatherData = weather.data;
    isCached = weather.isCached;
    fetchedAt = weather.fetchedAt;
  } else if (weather.status === 'error') {
    if (weather.fallbackData) {
      weatherData = weather.fallbackData;
      isCached = true;
      fetchedAt = weather.fetchedAt;
      errorMessage = weather.message;
    } else {
      return (
        <div className="weather-card">
          <div className="weather-header">
            <button
              type="button"
              className="weather-location"
              onClick={onOpenLocationPicker}
              title="Ubah lokasi cuaca"
            >
              <MapPin size={14} color="var(--accent)" />
              <span>{location.name}</span>
            </button>
          </div>
          <ErrorMessage message={weather.message} onRetry={onRefreshWeather} />
        </div>
      );
    }
  } else if (weather.status === 'loading') {
    return (
      <div className="weather-card" style={{ padding: '24px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Memuat data cuaca...</div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const codeInfo = getWeatherCodeInfo(weatherData.weatherCode, weatherData.isDay);
  const WeatherIcon = codeInfo.icon;

  const formattedFetchedTime = fetchedAt
    ? getLocalTimeString(new Date(fetchedAt))
    : '';

  return (
    <div className="weather-card">
      <div className="weather-header">
        <button
          type="button"
          className="weather-location"
          onClick={onOpenLocationPicker}
          title="Klik untuk mengubah lokasi cuaca"
          aria-label={`Lokasi: ${location.name}, klik untuk mengubah`}
        >
          <MapPin size={14} color="var(--accent)" />
          <span>{weatherData.locationName}</span>
        </button>
        <IconButton
          icon={<RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />}
          title="Segarkan cuaca"
          ariaLabel="Segarkan data cuaca"
          onClick={onRefreshWeather}
          disabled={isRefreshing}
        />
      </div>

      {errorMessage && (
        <div style={{ fontSize: '11px', color: 'var(--warning)', background: 'var(--warning-surface)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
          {errorMessage}
        </div>
      )}

      <div className="weather-main-row">
        <div className="weather-temp">{weatherData.temperature}°C</div>
        <div className="weather-condition-wrap">
          <WeatherIcon size={34} className="weather-icon-large" />
          <span className="weather-condition-text">{codeInfo.description}</span>
        </div>
      </div>

      <div className="weather-metrics-grid">
        <div className="weather-metric-item">
          <Thermometer size={13} color="var(--text-muted)" />
          <span>Terasa: {weatherData.apparentTemperature}°C</span>
        </div>
        <div className="weather-metric-item">
          <Thermometer size={13} color="var(--text-muted)" />
          <span>Min/Maks: {weatherData.temperatureMin}° / {weatherData.temperatureMax}°</span>
        </div>
        <div className="weather-metric-item">
          <CloudRain size={13} color="var(--text-muted)" />
          <span>Peluang Hujan: {weatherData.precipitationProbabilityMax}%</span>
        </div>
        <div className="weather-metric-item">
          <Droplets size={13} color="var(--text-muted)" />
          <span>Kelembapan: {weatherData.relativeHumidity}%</span>
        </div>
        <div className="weather-metric-item">
          <Wind size={13} color="var(--text-muted)" />
          <span>Angin: {weatherData.windSpeed} km/j</span>
        </div>
      </div>

      <div className="weather-footer">
        <div>
          {isCached && <span className="weather-stale-tag">Data tersimpan</span>}{' '}
          {formattedFetchedTime && <span>Pukul {formattedFetchedTime}</span>}
        </div>
        <span style={{ fontSize: '10px' }}>Data: Open-Meteo</span>
      </div>
    </div>
  );
};
