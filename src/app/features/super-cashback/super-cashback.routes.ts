import { Routes } from '@angular/router';

export const SUPER_CASHBACK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./mileback.component').then((m) => m.MilebackComponent),
  },
];
