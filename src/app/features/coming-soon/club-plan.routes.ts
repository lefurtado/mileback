import { Routes } from '@angular/router';

export const CLUB_PLAN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./coming-soon.component').then((m) => m.ComingSoonComponent),
    data: {
      title: 'Club Plan',
    },
  },
];
