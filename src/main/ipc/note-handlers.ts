import { JsonStore } from '../services/json-store';
import { saveNoteInputSchema } from '../../shared/schemas';
import { AppError } from '../utils/app-error';

export async function handleNoteSave(jsonStore: JsonStore, payload: unknown): Promise<void> {
  const parsed = saveNoteInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(`Catatan tidak valid: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
  }

  const nowIso = new Date().toISOString();
  await jsonStore.update((current) => ({
    ...current,
    quickNote: {
      text: parsed.data.text,
      updatedAt: nowIso,
    },
  }));
}
