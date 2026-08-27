import { useState, useEffect, useCallback } from 'react';
import {
  AppSnapshot,
  CreateAgendaInput,
  CreateTodoInput,
  UpdateSettingsInput,
} from '../../shared/contracts';

export function useBootstrapData() {
  const [snapshot, setSnapshot] = useState<AppSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBootstrap() {
      try {
        if (!window.dashboardAPI) {
          throw new Error('API Dashboard tidak tersedia di renderer.');
        }
        const data = await window.dashboardAPI.getBootstrapData();
        if (isMounted) {
          setSnapshot(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data awal');
          setIsLoading(false);
        }
      }
    }

    loadBootstrap();

    const unsubscribe = window.dashboardAPI?.onStateChanged((newSnapshot) => {
      if (isMounted) {
        setSnapshot(newSnapshot);
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const createAgenda = useCallback(async (input: CreateAgendaInput) => {
    const snap = await window.dashboardAPI.agenda.create(input);
    setSnapshot(snap);
  }, []);

  const updateAgenda = useCallback(async (id: string, input: CreateAgendaInput) => {
    const snap = await window.dashboardAPI.agenda.update({ id, ...input });
    setSnapshot(snap);
  }, []);

  const removeAgenda = useCallback(async (id: string) => {
    const snap = await window.dashboardAPI.agenda.remove(id);
    setSnapshot(snap);
  }, []);

  const createTodo = useCallback(async (input: CreateTodoInput) => {
    const snap = await window.dashboardAPI.todos.create(input);
    setSnapshot(snap);
  }, []);

  const updateTodo = useCallback(async (id: string, input: { title: string; carryOver: boolean }) => {
    const snap = await window.dashboardAPI.todos.update({ id, ...input });
    setSnapshot(snap);
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    const snap = await window.dashboardAPI.todos.toggle(id);
    setSnapshot(snap);
  }, []);

  const removeTodo = useCallback(async (id: string) => {
    const snap = await window.dashboardAPI.todos.remove(id);
    setSnapshot(snap);
  }, []);

  const saveNote = useCallback(async (text: string) => {
    const snap = await window.dashboardAPI.notes.save(text);
    setSnapshot(snap);
  }, []);

  const updateSettings = useCallback(async (input: UpdateSettingsInput) => {
    const snap = await window.dashboardAPI.settings.update(input);
    setSnapshot(snap);
  }, []);

  const refreshWeather = useCallback(async (force = true) => {
    setIsRefreshing(true);
    try {
      const res = await window.dashboardAPI.weather.refresh(force);
      setSnapshot((prev) => (prev ? { ...prev, weather: res } : null));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const hideWindow = useCallback(async () => {
    await window.dashboardAPI.window.hide();
  }, []);

  return {
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
  };
}
