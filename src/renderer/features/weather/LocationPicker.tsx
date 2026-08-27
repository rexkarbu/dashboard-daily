import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Location } from '../../../shared/contracts';

interface LocationPickerProps {
  onSelect: (location: Location) => void;
  onCancel?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onSelect, onCancel }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const list = await window.dashboardAPI.weather.searchLocations(trimmed);
        setResults(list);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal mencari lokasi');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '32px' }}
          placeholder="Ketik nama kota / wilayah (misal: Jakarta, Surabaya)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px', padding: '4px' }}>
          <Loader2 size={14} className="spin" />
          <span>Mencari lokasi...</span>
        </div>
      )}

      {error && <div className="form-error-msg">{error}</div>}

      {results.length > 0 && (
        <div className="location-search-list">
          {results.map((loc) => (
            <div
              key={loc.id}
              className="location-item"
              tabIndex={0}
              role="button"
              onClick={() => onSelect(loc)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelect(loc);
                }
              }}
            >
              <div className="location-item-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="var(--accent)" />
                <span>{loc.name}</span>
              </div>
              <div className="location-item-sub">
                {loc.admin1 ? `${loc.admin1}, ` : ''}
                {loc.country}
              </div>
            </div>
          ))}
        </div>
      )}

      {query.trim().length >= 2 && !isLoading && results.length === 0 && !error && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>
          Tidak ada lokasi ditemukan untuk "{query}".
        </div>
      )}

      {onCancel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Batal
          </button>
        </div>
      )}
    </div>
  );
};
