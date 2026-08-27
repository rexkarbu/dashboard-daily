import { BrowserWindow } from 'electron';
import { JsonStore } from '../services/json-store';
import { AutoStartService } from '../services/auto-start-service';
import { updateSettingsInputSchema } from '../../shared/schemas';
import { AppError } from '../utils/app-error';
import { repositionDashboardWindow } from '../window/window-position';
import { updateTrayMenu, TrayCallbacks } from '../tray/create-tray';

export async function handleSettingsUpdate(
  jsonStore: JsonStore,
  autoStartService: AutoStartService,
  window: BrowserWindow,
  trayCallbacks: TrayCallbacks,
  payload: unknown
): Promise<void> {
  const parsed = updateSettingsInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(`Pengaturan tidak valid: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
  }

  const updatedData = await jsonStore.update((current) => {
    const newLocation =
      parsed.data.location !== undefined ? parsed.data.location : current.settings.location;
    const locationChanged =
      (current.settings.location?.id ?? null) !== (newLocation?.id ?? null);

    const finalSettings = {
      ...current.settings,
      ...parsed.data,
      location: newLocation,
    };

    return {
      ...current,
      settings: finalSettings,
      // If location changed, invalidate previous location weather cache
      weatherCache: locationChanged ? null : current.weatherCache,
    };
  });

  // Apply OS / window effects
  if (parsed.data.alwaysOnTop !== undefined && !window.isDestroyed()) {
    window.setAlwaysOnTop(parsed.data.alwaysOnTop);
  }

  if (
    (parsed.data.corner !== undefined || parsed.data.margin !== undefined) &&
    !window.isDestroyed()
  ) {
    repositionDashboardWindow(
      window,
      updatedData.settings.corner,
      updatedData.settings.margin
    );
  }

  if (parsed.data.launchAtLogin !== undefined) {
    autoStartService.applyAutoStart(parsed.data.launchAtLogin);
  }

  updateTrayMenu(window, updatedData.settings, trayCallbacks);
}
