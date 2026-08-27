import { BrowserWindow, screen } from 'electron';
import { Corner } from '../../shared/contracts';

export interface WorkAreaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowPositionResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateWindowPosition(
  corner: Corner,
  margin: number,
  targetWidth: number,
  targetHeight: number,
  workArea: WorkAreaBounds
): WindowPositionResult {
  // Clamp dimensions if work area is smaller than desired size
  const actualWidth = Math.min(targetWidth, Math.max(280, workArea.width - margin * 2));
  const actualHeight = Math.min(targetHeight, Math.max(400, workArea.height - margin * 2));

  let x: number;
  let y: number;

  if (corner.includes('left')) {
    x = workArea.x + margin;
  } else {
    x = workArea.x + workArea.width - actualWidth - margin;
  }

  if (corner.includes('top')) {
    y = workArea.y + margin;
  } else {
    y = workArea.y + workArea.height - actualHeight - margin;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(actualWidth),
    height: Math.round(actualHeight),
  };
}

export function repositionDashboardWindow(
  window: BrowserWindow,
  corner: Corner,
  margin: number,
  baseWidth = 390,
  baseHeight = 640
): void {
  if (!window || window.isDestroyed()) return;

  const display = screen.getPrimaryDisplay();
  const workArea = display.workArea;

  const { x, y, width, height } = calculateWindowPosition(
    corner,
    margin,
    baseWidth,
    baseHeight,
    workArea
  );

  window.setBounds({ x, y, width, height });
}
