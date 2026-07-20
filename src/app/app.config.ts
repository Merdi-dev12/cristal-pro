import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { HeaderStateService } from './core/services/header-state';
import { RheodyceDataService } from './core/services/rheodyce-data.service';
import { MovingRequestService } from './core/services/moving-request.service';
import { Scroll } from './core/services/scroll';
import { AdminService } from './core/services/admin.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
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
  ]
};
