import { describe, it, expect } from 'vitest';
import { getWeatherCodeInfo } from '../../src/renderer/features/weather/weather-code';

describe('getWeatherCodeInfo', () => {
  it('should map WMO clear sky (0) correctly', () => {
    const day = getWeatherCodeInfo(0, 1);
    expect(day.description).toBe('Cerah');

    const night = getWeatherCodeInfo(0, 0);
    expect(night.description).toBe('Malam Cerah');
  });

  it('should map partly cloudy (1, 2) and overcast (3)', () => {
    expect(getWeatherCodeInfo(1).description).toBe('Sebagian cerah');
    expect(getWeatherCodeInfo(2).description).toBe('Berawan sebagian');
    expect(getWeatherCodeInfo(3).description).toBe('Mendung');
  });

  it('should map fog (45, 48)', () => {
    expect(getWeatherCodeInfo(45).description).toBe('Berkabut');
    expect(getWeatherCodeInfo(48).description).toBe('Berkabut');
  });

  it('should map drizzle and rain codes (51, 61, 80)', () => {
    expect(getWeatherCodeInfo(51).description).toBe('Gerimis');
    expect(getWeatherCodeInfo(61).description).toBe('Hujan');
    expect(getWeatherCodeInfo(80).description).toBe('Hujan lokal');
  });

  it('should map thunderstorm codes (95, 96, 99)', () => {
    expect(getWeatherCodeInfo(95).description).toBe('Badai petir');
    expect(getWeatherCodeInfo(99).description).toBe('Badai petir & hujan es');
  });

  it('should return fallback description for unknown weather codes', () => {
    const fallback = getWeatherCodeInfo(9999);
    expect(fallback.description).toBe('Berawan');
    expect(fallback.icon).toBeDefined();
  });
});
