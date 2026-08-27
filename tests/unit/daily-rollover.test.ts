import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { JsonStore } from '../../src/main/services/json-store';
import { DailyRolloverService } from '../../src/main/services/daily-rollover-service';
import { TodoItem } from '../../src/shared/contracts';

describe('DailyRolloverService', () => {
  let tempDir: string;
  let testFilePath: string;
  let jsonStore: JsonStore;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashboard-rollover-test-'));
    testFilePath = path.join(tempDir, 'data.json');
    jsonStore = new JsonStore(testFilePath);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should not carry over completed todos', async () => {
    await jsonStore.init();
    const completedTodo: TodoItem = {
      id: 't-1',
      seriesId: 's-1',
      date: '2026-08-20',
      title: 'Tugas yang sudah selesai',
      completed: true,
      carryOver: true,
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-08-20T11:00:00.000Z',
    };

    await jsonStore.update((curr) => ({
      ...curr,
      todos: [completedTodo],
      meta: { lastRolloverDate: '2026-08-20' },
    }));

    const mockClock = () => new Date(2026, 7, 21, 8, 0, 0); // 2026-08-21
    const service = new DailyRolloverService(jsonStore, mockClock);
    const result = await service.performRolloverIfNeeded();

    const todayItems = result.todos.filter((t) => t.date === '2026-08-21');
    expect(todayItems.length).toBe(0);
    expect(result.meta.lastRolloverDate).toBe('2026-08-21');
  });

  it('should not carry over uncompleted todos with carryOver=false', async () => {
    await jsonStore.init();
    const noCarryTodo: TodoItem = {
      id: 't-2',
      seriesId: 's-2',
      date: '2026-08-20',
      title: 'Tugas satu hari saja',
      completed: false,
      carryOver: false,
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-08-20T10:00:00.000Z',
    };

    await jsonStore.update((curr) => ({
      ...curr,
      todos: [noCarryTodo],
      meta: { lastRolloverDate: '2026-08-20' },
    }));

    const mockClock = () => new Date(2026, 7, 21, 8, 0, 0);
    const service = new DailyRolloverService(jsonStore, mockClock);
    const result = await service.performRolloverIfNeeded();

    const todayItems = result.todos.filter((t) => t.date === '2026-08-21');
    expect(todayItems.length).toBe(0);
  });

  it('should carry over uncompleted todo with carryOver=true to today', async () => {
    await jsonStore.init();
    const uncompletedTodo: TodoItem = {
      id: 't-3',
      seriesId: 's-3',
      date: '2026-08-20',
      title: 'Tugas penting yang tertunda',
      completed: false,
      carryOver: true,
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-08-20T10:00:00.000Z',
    };

    await jsonStore.update((curr) => ({
      ...curr,
      todos: [uncompletedTodo],
      meta: { lastRolloverDate: '2026-08-20' },
    }));

    const mockClock = () => new Date(2026, 7, 21, 8, 0, 0);
    const service = new DailyRolloverService(jsonStore, mockClock);
    const result = await service.performRolloverIfNeeded();

    const todayItems = result.todos.filter((t) => t.date === '2026-08-21');
    expect(todayItems.length).toBe(1);
    expect(todayItems[0].title).toBe('Tugas penting yang tertunda');
    expect(todayItems[0].seriesId).toBe('s-3');
    expect(todayItems[0].carriedFromId).toBe('t-3');
    expect(todayItems[0].completed).toBe(false);
  });

  it('should only carry over once directly to current day when multiple days pass', async () => {
    await jsonStore.init();
    const oldTodo: TodoItem = {
      id: 't-4',
      seriesId: 's-4',
      date: '2026-08-15',
      title: 'Tugas dari 5 hari lalu',
      completed: false,
      carryOver: true,
      createdAt: '2026-08-15T10:00:00.000Z',
      updatedAt: '2026-08-15T10:00:00.000Z',
    };

    await jsonStore.update((curr) => ({
      ...curr,
      todos: [oldTodo],
      meta: { lastRolloverDate: '2026-08-15' },
    }));

    const mockClock = () => new Date(2026, 7, 20, 8, 0, 0); // 2026-08-20
    const service = new DailyRolloverService(jsonStore, mockClock);
    const result = await service.performRolloverIfNeeded();

    // Total todos should be original + 1 clone on 2026-08-20 (no intermediary clones on 16, 17, 18, 19)
    expect(result.todos.length).toBe(2);
    expect(result.todos.filter((t) => t.date === '2026-08-20').length).toBe(1);
  });

  it('should be idempotent and not duplicate items on repeated executions on same day', async () => {
    await jsonStore.init();
    const todo: TodoItem = {
      id: 't-5',
      seriesId: 's-5',
      date: '2026-08-20',
      title: 'Tugas uji coba',
      completed: false,
      carryOver: true,
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-08-20T10:00:00.000Z',
    };

    await jsonStore.update((curr) => ({
      ...curr,
      todos: [todo],
      meta: { lastRolloverDate: '2026-08-20' },
    }));

    const mockClock = () => new Date(2026, 7, 21, 8, 0, 0);
    const service = new DailyRolloverService(jsonStore, mockClock);

    await service.performRolloverIfNeeded();
    const secondPass = await service.performRolloverIfNeeded();

    expect(secondPass.todos.filter((t) => t.date === '2026-08-21').length).toBe(1);
  });

  it('should not clone if series already has an item today', async () => {
    await jsonStore.init();
    const pastTodo: TodoItem = {
      id: 't-6a',
      seriesId: 's-6',
      date: '2026-08-20',
      title: 'Tugas Series 6',
      completed: false,
      carryOver: true,
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-08-20T10:00:00.000Z',
    };

    const todayTodo: TodoItem = {
      id: 't-6b',
      seriesId: 's-6',
      date: '2026-08-21',
      title: 'Tugas Series 6 (Sudah ada hari ini)',
      completed: false,
      carryOver: true,
      createdAt: '2026-08-21T07:00:00.000Z',
      updatedAt: '2026-08-21T07:00:00.000Z',
    };

    await jsonStore.update((curr) => ({
      ...curr,
      todos: [pastTodo, todayTodo],
      meta: { lastRolloverDate: '2026-08-20' },
    }));

    const mockClock = () => new Date(2026, 7, 21, 8, 0, 0);
    const service = new DailyRolloverService(jsonStore, mockClock);
    const result = await service.performRolloverIfNeeded();

    const seriesItemsToday = result.todos.filter((t) => t.seriesId === 's-6' && t.date === '2026-08-21');
    expect(seriesItemsToday.length).toBe(1);
    expect(seriesItemsToday[0].id).toBe('t-6b');
  });
});
