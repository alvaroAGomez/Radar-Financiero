import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-shell/dashboard-shell').then(
        (m) => m.DashboardShell,
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
