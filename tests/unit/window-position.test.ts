import { describe, it, expect } from 'vitest';
import {
  calculateWindowPosition,
  WorkAreaBounds,
} from '../../src/main/window/window-position';

describe('calculateWindowPosition', () => {
  const primaryWorkArea: WorkAreaBounds = {
    x: 0,
    y: 0,
    width: 1920,
    height: 1040,
  };

  const margin = 16;
  const targetWidth = 390;
  const targetHeight = 640;

  it('should calculate top-right corner on primary display', () => {
    const pos = calculateWindowPosition(
      'top-right',
      margin,
      targetWidth,
      targetHeight,
      primaryWorkArea
    );

    expect(pos.x).toBe(1920 - 390 - 16); // 1514
    expect(pos.y).toBe(16);
    expect(pos.width).toBe(390);
    expect(pos.height).toBe(640);
  });

  it('should calculate top-left corner on primary display', () => {
    const pos = calculateWindowPosition(
      'top-left',
      margin,
      targetWidth,
      targetHeight,
      primaryWorkArea
    );

    expect(pos.x).toBe(16);
    expect(pos.y).toBe(16);
  });

  it('should calculate bottom-right corner on primary display', () => {
    const pos = calculateWindowPosition(
      'bottom-right',
      margin,
      targetWidth,
      targetHeight,
      primaryWorkArea
    );

    expect(pos.x).toBe(1920 - 390 - 16);
    expect(pos.y).toBe(1040 - 640 - 16); // 384
  });

  it('should calculate bottom-left corner on primary display', () => {
    const pos = calculateWindowPosition(
      'bottom-left',
      margin,
      targetWidth,
      targetHeight,
      primaryWorkArea
    );

    expect(pos.x).toBe(16);
    expect(pos.y).toBe(1040 - 640 - 16);
  });

  it('should support non-zero offsets for secondary monitors', () => {
    const secondaryWorkArea: WorkAreaBounds = {
      x: 1920,
      y: 40,
      width: 1920,
      height: 1040,
    };

    const pos = calculateWindowPosition(
      'top-right',
      margin,
      targetWidth,
      targetHeight,
      secondaryWorkArea
    );

    expect(pos.x).toBe(1920 + 1920 - 390 - 16);
    expect(pos.y).toBe(40 + 16);
  });

  it('should clamp dimensions when display workArea is smaller than desired size', () => {
    const smallWorkArea: WorkAreaBounds = {
      x: 0,
      y: 0,
      width: 350,
      height: 500,
    };

    const pos = calculateWindowPosition(
      'top-right',
      margin,
      targetWidth,
      targetHeight,
      smallWorkArea
    );

    expect(pos.width).toBe(350 - 32); // 318
    expect(pos.height).toBe(500 - 32); // 468
    expect(pos.x).toBe(16);
    expect(pos.y).toBe(16);
  });
});
