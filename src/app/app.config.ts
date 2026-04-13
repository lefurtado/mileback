import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxCurrency, NgxCurrencyInputMode } from 'ngx-currency';

import { routes } from './app.routes';
import { provideZard } from '@/shared/core/provider/providezard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    provideZard(),
    provideEnvironmentNgxCurrency({
      align: 'left',
      allowNegative: false,
      allowZero: true,
      decimal: ',',
      precision: 2,
      prefix: 'R$ ',
      suffix: '',
      thousands: '.',
      nullable: true,
      inputMode: NgxCurrencyInputMode.Financial,
    }),
  ],
};
