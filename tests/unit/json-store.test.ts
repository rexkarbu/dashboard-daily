import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { JsonStore } from '../../src/main/services/json-store';
import { DEFAULT_APP_DATA } from '../../src/shared/defaults';

describe('JsonStore', () => {
  let tempDir: string;
  let testFilePath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashboard-json-test-'));
    testFilePath = path.join(tempDir, 'dashboard-data.json');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should initialize and create default data file if not present', async () => {
    const store = new JsonStore(testFilePath);
    const data = await store.init();

    expect(data.schemaVersion).toBe(1);
    expect(data.settings.corner).toBe('top-right');
    expect(fs.existsSync(testFilePath)).toBe(true);
  });

  it('should reject invalid modifications via Zod validation', async () => {
    const store = new JsonStore(testFilePath);
    await store.init();

    await expect(
      store.update((curr) => ({
        ...curr,
        settings: {
          ...curr.settings,
          margin: 9999, // Exceeds max 128
        },
      }))
    ).rejects.toThrow();
  });

  it('should handle concurrent updates without race conditions or data loss', async () => {
    const store = new JsonStore(testFilePath);
    await store.init();

    const tasks = Array.from({ length: 10 }, (_, i) =>
      store.update((curr) => ({
        ...curr,
        todos: [
          ...curr.todos,
          {
            id: `todo-${i}`,
            seriesId: `series-${i}`,
            date: '2026-08-25',
            title: `Concurrent Todo ${i}`,
            completed: false,
            carryOver: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }))
    );

    await Promise.all(tasks);

    const finalData = await store.getData();
    expect(finalData.todos.length).toBe(10);
  });

  it('should recover from backup if primary file is corrupted', async () => {
    const store = new JsonStore(testFilePath);
    await store.init();

    // Perform a valid update so backup is created
    await store.update((curr) => ({
      ...curr,
      quickNote: { text: 'Pesan penting tersimpan', updatedAt: new Date().toISOString() },
    }));

    // Corrupt primary file
    fs.writeFileSync(testFilePath, 'INVALID_CORRUPT_JSON_CONTENT{{{', 'utf8');

    // Create a new store instance pointing to the same file
    const recoveredStore = new JsonStore(testFilePath);
    const data = await recoveredStore.init();

    expect(data.quickNote.text).toBe('Pesan penting tersimpan');
    expect(recoveredStore.getSystemNotice()).toContain('dipulihkan');
  });

  it('should fallback to default and preserve corrupt file if both primary and backup are corrupt', async () => {
    const backupPath = `${testFilePath}.bak`;
    fs.writeFileSync(testFilePath, 'CORRUPT_PRIMARY', 'utf8');
    fs.writeFileSync(backupPath, 'CORRUPT_BACKUP', 'utf8');

    const store = new JsonStore(testFilePath);
    const data = await store.init();

    expect(data.schemaVersion).toBe(DEFAULT_APP_DATA.schemaVersion);
    expect(store.getSystemNotice()).toContain('rusak');

    // Verify a corrupt archive file was created
    const files = fs.readdirSync(tempDir);
    const corruptFile = files.find((f) => f.includes('.corrupt-'));
    expect(corruptFile).toBeDefined();
  });
});
