import { app } from 'electron';
import { AppLifecycle } from './app-lifecycle';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
} else {
  const lifecycle = new AppLifecycle();
  lifecycle.start().catch((err) => {
    console.error('Fatal error during application startup:', err);
    app.quit();
  });
}
