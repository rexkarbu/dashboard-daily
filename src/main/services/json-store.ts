import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { AppData } from '../../shared/contracts';
import { DEFAULT_APP_DATA } from '../../shared/defaults';
import { appDataSchema } from '../../shared/schemas';

export class JsonStore {
  private readonly filePath: string;
  private readonly backupPath: string;
  private writeQueue: Promise<void> = Promise.resolve();
  private cachedData: AppData | null = null;
  private systemNotice: string | null = null;

  constructor(customFilePath?: string) {
    if (customFilePath) {
      this.filePath = customFilePath;
    } else {
      const userDataPath = app?.getPath ? app.getPath('userData') : process.cwd();
      this.filePath = path.join(userDataPath, 'dashboard-daily.json');
    }
    this.backupPath = `${this.filePath}.bak`;
  }

  public getSystemNotice(): string | null {
    return this.systemNotice;
  }

  public clearSystemNotice(): void {
    this.systemNotice = null;
  }

  public async init(): Promise<AppData> {
    return this.enqueue(async () => {
      this.cachedData = this.loadAndValidate();
      return this.cachedData;
    });
  }

  public async getData(): Promise<AppData> {
    if (this.cachedData) {
      return this.cachedData;
    }
    return this.init();
  }

  public async update(mutator: (current: AppData) => AppData): Promise<AppData> {
    return this.enqueue(async () => {
      const current = this.cachedData ?? this.loadAndValidate();
      // Deep clone to prevent unintended side effects before validation
      const cloned = JSON.parse(JSON.stringify(current)) as AppData;
      const modified = mutator(cloned);
      
      const parsed = appDataSchema.safeParse(modified);
      if (!parsed.success) {
        throw new Error(`Data tidak valid: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
      }

      this.atomicWrite(parsed.data);
      this.cachedData = parsed.data;
      return this.cachedData;
    });
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.writeQueue = this.writeQueue
        .then(async () => {
          try {
            const result = await task();
            resolve(result);
          } catch (err) {
            reject(err);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  private loadAndValidate(): AppData {
    const ensureDir = path.dirname(this.filePath);
    if (!fs.existsSync(ensureDir)) {
      fs.mkdirSync(ensureDir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      this.atomicWrite(DEFAULT_APP_DATA);
      return DEFAULT_APP_DATA;
    }

    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      const json = JSON.parse(content);
      const parsed = appDataSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      throw new Error('Data schema validation failed');
    } catch {
      // Primary file failed, attempt recovery from backup
      return this.recoverFromCorrupt();
    }
  }

  private recoverFromCorrupt(): AppData {
    if (fs.existsSync(this.backupPath)) {
      try {
        const backupContent = fs.readFileSync(this.backupPath, 'utf8');
        const backupJson = JSON.parse(backupContent);
        const parsed = appDataSchema.safeParse(backupJson);
        if (parsed.success) {
          // Restore backup to primary
          this.atomicWrite(parsed.data);
          this.systemNotice = 'Data dipulihkan dari cadangan otomatis terakhir.';
          return parsed.data;
        }
      } catch {
        // Backup also invalid
      }
    }

    // Both failed: preserve corrupt file with timestamp
    try {
      const timestamp = Date.now();
      const corruptPath = `${this.filePath}.corrupt-${timestamp}.json`;
      if (fs.existsSync(this.filePath)) {
        fs.renameSync(this.filePath, corruptPath);
      }
    } catch {
      // Ignore rename failure
    }

    // Fall back to default
    this.atomicWrite(DEFAULT_APP_DATA);
    this.systemNotice = 'Data lokal rusak dan telah direset ke pengaturan awal.';
    return DEFAULT_APP_DATA;
  }

  private atomicWrite(data: AppData): void {
    const ensureDir = path.dirname(this.filePath);
    if (!fs.existsSync(ensureDir)) {
      fs.mkdirSync(ensureDir, { recursive: true });
    }

    const jsonStr = JSON.stringify(data, null, 2);
    const tempPath = `${this.filePath}.tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    fs.writeFileSync(tempPath, jsonStr, 'utf8');

    // Atomic replace
    fs.renameSync(tempPath, this.filePath);

    // Update backup with last known valid state
    try {
      fs.copyFileSync(this.filePath, this.backupPath);
    } catch {
      // Ignore backup copy failure
    }
  }
}
