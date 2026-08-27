import * as crypto from 'crypto';
import { JsonStore } from '../services/json-store';
import { createAgendaInputSchema, updateAgendaInputSchema } from '../../shared/schemas';
import { AppError } from '../utils/app-error';
import { AgendaItem } from '../../shared/contracts';

export async function handleAgendaCreate(jsonStore: JsonStore, payload: unknown): Promise<void> {
  const parsed = createAgendaInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(`Data agenda tidak valid: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
  }

  const nowIso = new Date().toISOString();
  const newItem: AgendaItem = {
    id: crypto.randomUUID(),
    date: parsed.data.date,
    title: parsed.data.title,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime || undefined,
    notes: parsed.data.notes || undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await jsonStore.update((current) => ({
    ...current,
    agenda: [...current.agenda, newItem],
  }));
}

export async function handleAgendaUpdate(jsonStore: JsonStore, payload: unknown): Promise<void> {
  const parsed = updateAgendaInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(`Data update agenda tidak valid: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
  }

  const nowIso = new Date().toISOString();
  await jsonStore.update((current) => {
    const index = current.agenda.findIndex((item) => item.id === parsed.data.id);
    if (index === -1) {
      throw new AppError('Agenda tidak ditemukan');
    }

    const updatedList = [...current.agenda];
    updatedList[index] = {
      ...updatedList[index],
      date: parsed.data.date,
      title: parsed.data.title,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime || undefined,
      notes: parsed.data.notes || undefined,
      updatedAt: nowIso,
    };

    return {
      ...current,
      agenda: updatedList,
    };
  });
}

export async function handleAgendaRemove(jsonStore: JsonStore, id: unknown): Promise<void> {
  if (typeof id !== 'string' || !id) {
    throw new AppError('ID agenda tidak valid');
  }

  await jsonStore.update((current) => ({
    ...current,
    agenda: current.agenda.filter((item) => item.id !== id),
  }));
}
