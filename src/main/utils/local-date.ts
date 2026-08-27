/**
 * Local Date Utilities
 * Always use local year, month, and day rather than UTC slices from toISOString().
 */

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export function formatIndonesianDate(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return dateKey;
  }
  const [year, month, day] = parts;
  const dateObj = new Date(year, month - 1, day);
  const dayName = INDONESIAN_DAYS[dateObj.getDay()] || '';
  const monthName = INDONESIAN_MONTHS[month - 1] || '';

  return `${dayName}, ${day} ${monthName} ${year}`;
}
