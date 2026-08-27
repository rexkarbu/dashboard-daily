import * as crypto from 'crypto';
import { JsonStore } from './json-store';
import { AppData, TodoItem } from '../../shared/contracts';
import { getLocalDateKey } from '../utils/local-date';

export type ClockFn = () => Date;

export class DailyRolloverService {
  private readonly jsonStore: JsonStore;
  private readonly clock: ClockFn;
  private timer: NodeJS.Timeout | null = null;
  private onStateChangeCallback?: (data: AppData) => void;

  constructor(jsonStore: JsonStore, clock: ClockFn = () => new Date()) {
    this.jsonStore = jsonStore;
    this.clock = clock;
  }

  public setOnStateChange(cb: (data: AppData) => void): void {
    this.onStateChangeCallback = cb;
  }

  public async performRolloverIfNeeded(): Promise<AppData> {
    const today = getLocalDateKey(this.clock());
    const nowIso = this.clock().toISOString();

    const updatedData = await this.jsonStore.update((current) => {
      // If already performed for today, do nothing
      if (current.meta.lastRolloverDate === today) {
        return current;
      }

      const existingTodos = current.todos;
      const seriesMap = new Map<string, TodoItem[]>();

      // Group all todos by seriesId
      for (const todo of existingTodos) {
        const list = seriesMap.get(todo.seriesId) || [];
        list.push(todo);
        seriesMap.set(todo.seriesId, list);
      }

      const newRolledTodos: TodoItem[] = [];

      for (const [seriesId, items] of seriesMap.entries()) {
        // Check if there is already an item for today
        const hasTodayItem = items.some((item) => item.date === today);
        if (hasTodayItem) {
          continue;
        }

        // Get past items before today
        const pastItems = items
          .filter((item) => item.date < today)
          .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

        if (pastItems.length === 0) {
          continue;
        }

        const mostRecentPastItem = pastItems[0];
        // If not completed and carry-over enabled, carry it over to today
        if (!mostRecentPastItem.completed && mostRecentPastItem.carryOver) {
          const carriedTodo: TodoItem = {
            id: crypto.randomUUID(),
            seriesId,
            date: today,
            title: mostRecentPastItem.title,
            completed: false,
            carryOver: true,
            carriedFromId: mostRecentPastItem.id,
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          newRolledTodos.push(carriedTodo);
        }
      }

      return {
        ...current,
        todos: [...existingTodos, ...newRolledTodos],
        meta: {
          ...current.meta,
          lastRolloverDate: today,
        },
      };
    });

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(updatedData);
    }

    return updatedData;
  }

  public startPeriodicCheck(intervalMs = 60000): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.performRolloverIfNeeded().catch((err) => {
        console.error('Failed periodic rollover check:', err);
      });
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
