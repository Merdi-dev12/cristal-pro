import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { HeaderStateService } from './core/services/header-state';
import { RheodyceDataService } from './core/services/rheodyce-data.service';
import { MovingRequestService } from './core/services/moving-request.service';
import { Scroll } from './core/services/scroll';
import { AdminService } from './core/services/admin.service';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideAppInitializer(() => inject(AuthService).init()),
    provideAppInitializer(() => inject(RheodyceDataService).load()),
    AuthService,
    HeaderStateService,
    RheodyceDataService,
    MovingRequestService,
    AdminService,
    Scroll,
  ],
};
