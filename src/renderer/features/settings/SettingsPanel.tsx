import React, { useState } from 'react';
import {
  AppSettings,
  Corner,
  Location,
  UpdateSettingsInput,
} from '../../../shared/contracts';
import { LocationPicker } from '../weather/LocationPicker';
import { MapPin } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  isPackaged: boolean;
  onUpdateSettings: (input: UpdateSettingsInput) => Promise<void>;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  isPackaged,
  onUpdateSettings,
  onClose,
}) => {
  const [isChangingLocation, setIsChangingLocation] = useState(false);

  const handleCornerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({ corner: e.target.value as Corner });
  };

  const handleAlwaysOnTopToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ alwaysOnTop: e.target.checked });
  };

  const handleLaunchAtLoginToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ launchAtLogin: e.target.checked });
  };

  const handleSelectLocation = async (loc: Location) => {
    await onUpdateSettings({ location: loc });
    setIsChangingLocation(false);
  };

  return (
    <div className="modal-body">
      {/* Location Setting */}
      <div className="form-group">
        <label className="form-label">Lokasi Cuaca</label>
        {isChangingLocation ? (
          <LocationPicker
            onSelect={handleSelectLocation}
            onCancel={() => setIsChangingLocation(false)}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="var(--accent)" />
              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {settings.location
                  ? `${settings.location.name}${settings.location.admin1 ? ', ' + settings.location.admin1 : ''}`
                  : 'Belum diatur'}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '2px 8px', fontSize: '11px' }}
              onClick={() => setIsChangingLocation(true)}
            >
              {settings.location ? 'Ubah' : 'Pilih Lokasi'}
            </button>
          </div>
        )}
      </div>

      {/* Corner Setting */}
      <div className="form-group">
        <label className="form-label" htmlFor="settings-corner">
          Posisi Pojok Widget
        </label>
        <select
          id="settings-corner"
          className="form-select"
          value={settings.corner}
          onChange={handleCornerChange}
        >
          <option value="top-right">Kanan Atas (Default)</option>
          <option value="top-left">Kiri Atas</option>
          <option value="bottom-right">Kanan Bawah</option>
          <option value="bottom-left">Kiri Bawah</option>
        </select>
      </div>

      {/* Always On Top Toggle */}
      <div className="form-group" style={{ marginTop: '4px' }}>
        <label className="form-checkbox-label" htmlFor="settings-always-on-top">
          <input
            id="settings-always-on-top"
            type="checkbox"
            className="todo-checkbox"
            checked={settings.alwaysOnTop}
            onChange={handleAlwaysOnTopToggle}
          />
          <span>Selalu tampil di atas jendela lain (Always on top)</span>
        </label>
      </div>

      {/* Launch at login Toggle */}
      <div className="form-group">
        <label className="form-checkbox-label" htmlFor="settings-launch-login">
          <input
            id="settings-launch-login"
            type="checkbox"
            className="todo-checkbox"
            checked={settings.launchAtLogin}
            onChange={handleLaunchAtLoginToggle}
          />
          <span>Jalankan otomatis saat komputer menyala</span>
        </label>
        {!isPackaged && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '25px' }}>
            * Auto-start aktif setelah aplikasi di-install (mode packaged).
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Tutup
        </button>
      </div>
    </div>
  );
};
