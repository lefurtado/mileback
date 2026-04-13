import { Routes } from '@angular/router';

export const CREDIT_CARD_FEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./coming-soon.component').then((m) => m.ComingSoonComponent),
    data: {
      title: 'Credit Card Fee',
    },
  },
];
