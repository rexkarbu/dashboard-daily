import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { app } from 'electron';

export class AutoStartService {
  public applyAutoStart(enabled: boolean): { success: boolean; notice?: string } {
    if (!app.isPackaged) {
      return {
        success: true,
        notice: 'Pengaturan auto-start aktif saat aplikasi telah di-install/di-package.',
      };
    }

    try {
      if (process.platform === 'win32' || process.platform === 'darwin') {
        app.setLoginItemSettings({
          openAtLogin: enabled,
        });
        return { success: true };
      }

      if (process.platform === 'linux') {
        const autostartDir = path.join(os.homedir(), '.config', 'autostart');
        const desktopFilePath = path.join(autostartDir, 'dashboard-daily.desktop');

        if (enabled) {
          if (!fs.existsSync(autostartDir)) {
            fs.mkdirSync(autostartDir, { recursive: true });
          }
          const execPath = process.execPath;
          const desktopEntry = `[Desktop Entry]
Type=Application
Version=1.0
Name=Dashboard Daily
Comment=Desktop widget harian kompak
Exec="${execPath}"
StartupNotify=false
Terminal=false
`;
          fs.writeFileSync(desktopFilePath, desktopEntry, 'utf8');
        } else {
          if (fs.existsSync(desktopFilePath)) {
            fs.unlinkSync(desktopFilePath);
          }
        }
        return { success: true };
      }

      return { success: true };
    } catch (err) {
      console.error('Gagal menerapkan auto-start:', err);
      return {
        success: false,
        notice: 'Gagal memperbarui konfigurasi startup sistem operasi.',
      };
    }
  }
}
