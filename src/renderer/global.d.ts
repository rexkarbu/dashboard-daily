import { DashboardAPI } from '../shared/contracts';

declare global {
  interface Window {
    dashboardAPI: DashboardAPI;
  }
}
