export class AppError extends Error {
  public readonly isSafeUserFacing: boolean;

  constructor(message: string, isSafeUserFacing = true) {
    super(message);
    this.name = 'AppError';
    this.isSafeUserFacing = isSafeUserFacing;
  }
}

export function formatErrorMessage(error: unknown, fallbackMessage = 'Terjadi kesalahan sistem'): string {
  if (error instanceof AppError && error.isSafeUserFacing) {
    return error.message;
  }
  if (error instanceof Error) {
    // In production or safe UI, avoid exposing full system stack/paths
    return error.message || fallbackMessage;
  }
  return fallbackMessage;
}
