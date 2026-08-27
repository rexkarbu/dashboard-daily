import { describe, it, expect } from 'vitest';
import { getLocalDateKey, formatIndonesianDate, getLocalTimeString } from '../../src/main/utils/local-date';

describe('Local Date Utilities', () => {
  it('should format date using local year, month, and day without UTC offset shift', () => {
    // Construct a specific local date
    const d = new Date(2026, 7, 25, 23, 30, 0); // August 25, 2026 (Month is 0-indexed)
    const key = getLocalDateKey(d);
    expect(key).toBe('2026-08-25');
  });

  it('should format Indonesian readable date correctly', () => {
    const formatted = formatIndonesianDate('2026-08-25');
    expect(formatted).toBe('Selasa, 25 Agustus 2026');
  });

  it('should format local time string HH:mm with zero padding', () => {
    const d = new Date(2026, 7, 25, 9, 5, 0);
    const timeStr = getLocalTimeString(d);
    expect(timeStr).toBe('09:05');
  });
});
