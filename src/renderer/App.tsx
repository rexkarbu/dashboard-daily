import React, { useState } from 'react';
import { useBootstrapData } from './hooks/use-bootstrap-data';
import { DashboardHeader } from './components/DashboardHeader';
import { WeatherCard } from './features/weather/WeatherCard';
import { LocationPicker } from './features/weather/LocationPicker';
import { AgendaSection } from './features/agenda/AgendaSection';
import { TodoSection } from './features/todos/TodoSection';
import { QuickNote } from './features/notes/QuickNote';
import { SettingsPanel } from './features/settings/SettingsPanel';
import { Modal } from './components/Modal';
import { ErrorMessage } from './components/ErrorMessage';
import { Location } from '../shared/contracts';
import { AlertTriangle, Info } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Renderer Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-container" style={{ padding: '24px', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={32} color="var(--danger)" />
            <h2 style={{ fontSize: '15px', color: 'var(--text-primary)' }}>Terjadi Kesalahan Tampilan</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Silakan muat ulang widget ini.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  const {
    snapshot,
    isLoading,
    error,
    isRefreshing,
    createAgenda,
    updateAgenda,
    removeAgenda,
    createTodo,
    updateTodo,
    toggleTodo,
    removeTodo,
    saveNote,
    updateSettings,
    refreshWeather,
    hideWindow,
  } = useBootstrapData();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="widget-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Memuat Dashboard Daily...</div>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="widget-container" style={{ padding: '20px', justifyContent: 'center' }}>
        <ErrorMessage message={error || 'Data tidak dapat dimuat.'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const { data, today, weather, isPackaged, systemNotice } = snapshot;

  const handleSelectLocation = async (loc: Location) => {
    await updateSettings({ location: loc });
    setIsLocationPickerOpen(false);
    await refreshWeather(true);
  };

  return (
    <ErrorBoundary>
      <div className="widget-container">
        {systemNotice && (
          <div className="system-notice">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={13} style={{ flexShrink: 0 }} />
              <span>{systemNotice}</span>
            </div>
          </div>
        )}

        <DashboardHeader
          today={today}
          isRefreshing={isRefreshing}
          onRefresh={() => refreshWeather(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onHideWindow={hideWindow}
        />

        <main className="widget-content">
          {/* Weather Feature */}
          <WeatherCard
            location={data.settings.location}
            weather={weather}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
            onRefreshWeather={() => refreshWeather(true)}
            isRefreshing={isRefreshing}
          />

          {/* Agenda Feature */}
          <AgendaSection
            agenda={data.agenda}
            today={today}
            onCreateAgenda={createAgenda}
            onUpdateAgenda={updateAgenda}
            onDeleteAgenda={removeAgenda}
          />

          {/* Todo Feature */}
          <TodoSection
            todos={data.todos}
            today={today}
            onCreateTodo={createTodo}
            onUpdateTodo={updateTodo}
            onToggleTodo={toggleTodo}
            onDeleteTodo={removeTodo}
          />

          {/* Quick Note Feature */}
          <QuickNote note={data.quickNote} onSaveNote={saveNote} />
        </main>

        {/* Location Picker Modal */}
        <Modal
          isOpen={isLocationPickerOpen}
          onClose={() => setIsLocationPickerOpen(false)}
          title="Pilih Lokasi Cuaca"
        >
          <div className="modal-body">
            <LocationPicker
              onSelect={handleSelectLocation}
              onCancel={() => setIsLocationPickerOpen(false)}
            />
          </div>
        </Modal>

        {/* Settings Modal */}
        <Modal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          title="Pengaturan Widget"
        >
          <SettingsPanel
            settings={data.settings}
            isPackaged={isPackaged}
            onUpdateSettings={updateSettings}
            onClose={() => setIsSettingsOpen(false)}
          />
        </Modal>
      </div>
    </ErrorBoundary>
  );
};
