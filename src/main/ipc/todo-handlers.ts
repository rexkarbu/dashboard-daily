import * as crypto from 'crypto';
import { JsonStore } from '../services/json-store';
import { createTodoInputSchema, updateTodoInputSchema } from '../../shared/schemas';
import { AppError } from '../utils/app-error';
import { TodoItem } from '../../shared/contracts';
import { getLocalDateKey } from '../utils/local-date';

export async function handleTodoCreate(jsonStore: JsonStore, payload: unknown): Promise<void> {
  const parsed = createTodoInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(`Data todo tidak valid: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
  }

  const nowIso = new Date().toISOString();
  const todoDate = parsed.data.date || getLocalDateKey(new Date());
  const seriesId = crypto.randomUUID();

  const newItem: TodoItem = {
    id: crypto.randomUUID(),
    seriesId,
    date: todoDate,
    title: parsed.data.title,
    completed: false,
    carryOver: parsed.data.carryOver ?? true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await jsonStore.update((current) => ({
    ...current,
    todos: [...current.todos, newItem],
  }));
}

export async function handleTodoUpdate(jsonStore: JsonStore, payload: unknown): Promise<void> {
  const parsed = updateTodoInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(`Data update todo tidak valid: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
  }

  const nowIso = new Date().toISOString();
  await jsonStore.update((current) => {
    const index = current.todos.findIndex((item) => item.id === parsed.data.id);
    if (index === -1) {
      throw new AppError('Todo tidak ditemukan');
    }

    const updatedList = [...current.todos];
    updatedList[index] = {
      ...updatedList[index],
      title: parsed.data.title,
      carryOver: parsed.data.carryOver,
      updatedAt: nowIso,
    };

    return {
      ...current,
      todos: updatedList,
    };
  });
}

export async function handleTodoToggle(jsonStore: JsonStore, id: unknown): Promise<void> {
  if (typeof id !== 'string' || !id) {
    throw new AppError('ID todo tidak valid');
  }

  const nowIso = new Date().toISOString();
  await jsonStore.update((current) => {
    const index = current.todos.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new AppError('Todo tidak ditemukan');
    }

    const updatedList = [...current.todos];
    const currentItem = updatedList[index];
    updatedList[index] = {
      ...currentItem,
      completed: !currentItem.completed,
      updatedAt: nowIso,
    };

    return {
      ...current,
      todos: updatedList,
    };
  });
}

export async function handleTodoRemove(jsonStore: JsonStore, id: unknown): Promise<void> {
  if (typeof id !== 'string' || !id) {
    throw new AppError('ID todo tidak valid');
  }

  await jsonStore.update((current) => ({
    ...current,
    todos: current.todos.filter((item) => item.id !== id),
  }));
}
