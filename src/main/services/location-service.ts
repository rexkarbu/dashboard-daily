import { Location } from '../../shared/contracts';
import { AppError } from '../utils/app-error';

export class LocationService {
  public async searchLocations(query: string): Promise<Location[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return [];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=5&language=id&format=json`;

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new AppError(`Gagal menghubungi server pencarian lokasi (${res.status})`);
      }
      const data = (await res.json()) as { results?: Array<{
        id: number;
        name: string;
        admin1?: string;
        country: string;
        latitude: number;
        longitude: number;
        timezone?: string;
      }> };

      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((item) => ({
        id: item.id,
        name: item.name,
        admin1: item.admin1,
        country: item.country,
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone || 'auto',
      }));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new AppError('Pencarian lokasi melebihi batas waktu (timeout).');
      }
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Tidak dapat terhubung ke server lokasi. Periksa koneksi internet Anda.');
    } finally {
      clearTimeout(timeout);
    }
  }
}
