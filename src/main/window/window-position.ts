import { BrowserWindow, screen } from 'electron';
import { Corner, WindowBounds } from '../../shared/contracts';

export interface WorkAreaBounds {
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
): WindowBounds {
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

export function validateAndRestoreBounds(
  savedBounds: Partial<WindowBounds> | null | undefined,
  displaysWorkAreas: WorkAreaBounds[],
  minWidth = 360,
  minHeight = 480
): WindowBounds | null {
  if (!savedBounds) return null;

  const { x, y } = savedBounds;
  let { width, height } = savedBounds;

  if (
    typeof x !== 'number' || !Number.isFinite(x) ||
    typeof y !== 'number' || !Number.isFinite(y) ||
    typeof width !== 'number' || !Number.isFinite(width) ||
    typeof height !== 'number' || !Number.isFinite(height)
  ) {
    return null; // Corrupted data
  }

  // Ensure minimum dimensions
  width = Math.max(width, minWidth);
  height = Math.max(height, minHeight);

  // Check if bounds intersect with ANY display
  // We need to ensure that the header (top 30px) is reachable.
  let isReachable = false;
  for (const display of displaysWorkAreas) {
    // 40px width threshold
    const isXIntersect = x + width - 40 > display.x && x + 40 < display.x + display.width;
    // Header is top 30px
    const isYIntersect = y < display.y + display.height && y + 30 > display.y;

    if (isXIntersect && isYIntersect) {
      isReachable = true;
      break;
    }
  }

  if (!isReachable) {
    return null;
  }

  return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
}

export function applyWindowBounds(
  window: BrowserWindow,
  savedBounds: Partial<WindowBounds> | null | undefined,
  corner: Corner,
  margin: number,
  baseWidth = 390,
  baseHeight = 640,
  minWidth = 360,
  minHeight = 480
): void {
  if (!window || window.isDestroyed()) return;

  const displays = screen.getAllDisplays().map((d) => d.workArea);
  const validBounds = validateAndRestoreBounds(savedBounds, displays, minWidth, minHeight);

  if (validBounds) {
    window.setBounds(validBounds);
  } else {
    // Fallback to default corner calculation
    const display = screen.getPrimaryDisplay();
    const workArea = display.workArea;

    const { x, y, width, height } = calculateWindowPosition(
      corner,
      margin,
      baseWidth,
      baseHeight,
      workArea
    );
    // Make sure fallback respects min bounds too
    window.setBounds({
      x,
      y,
      width: Math.max(width, minWidth),
      height: Math.max(height, minHeight)
    });
  }
}
