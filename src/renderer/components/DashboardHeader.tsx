import React from 'react';
import { RefreshCw, Settings as SettingsIcon, EyeOff } from 'lucide-react';
import { IconButton } from './IconButton';
import { formatIndonesianDate } from '../../main/utils/local-date';

interface DashboardHeaderProps {
  today: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onHideWindow: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  today,
  isRefreshing = false,
  onRefresh,
  onOpenSettings,
  onHideWindow,
}) => {
  const formattedDate = formatIndonesianDate(today);

  return (
    <header className="dashboard-header">
      <div>
        <h1 className="header-date-title">{formattedDate}</h1>
        <p className="header-date-subtitle">Dashboard Daily</p>
      </div>
      <div className="header-actions">
        <IconButton
          icon={<RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />}
          title="Segarkan data"
          ariaLabel="Segarkan data cuaca dan agenda"
          onClick={onRefresh}
          disabled={isRefreshing}
        />
        <IconButton
          icon={<SettingsIcon size={15} />}
          title="Pengaturan"
          ariaLabel="Buka pengaturan widget"
          onClick={onOpenSettings}
        />
        <IconButton
          icon={<EyeOff size={15} />}
          title="Sembunyikan ke System Tray"
          ariaLabel="Sembunyikan widget ke system tray"
          onClick={onHideWindow}
        />
      </div>
    </header>
  );
};
