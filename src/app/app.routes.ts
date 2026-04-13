import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'super-cashback',
  },
  {
    path: 'super-cashback',
    loadChildren: () =>
      import('./features/super-cashback/super-cashback.routes').then((m) => m.SUPER_CASHBACK_ROUTES),
  },
  {
    path: 'credit-card-fee',
    loadChildren: () =>
      import('./features/coming-soon/credit-card-fee.routes').then((m) => m.CREDIT_CARD_FEE_ROUTES),
  },
  {
    path: 'club-plan',
    loadChildren: () =>
      import('./features/coming-soon/club-plan.routes').then((m) => m.CLUB_PLAN_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'super-cashback',
  },
];
