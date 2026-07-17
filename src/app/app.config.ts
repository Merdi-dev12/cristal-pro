import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { HeaderStateService } from './core/services/header-state';
import { RheodyceDataService } from './core/services/rheodyce-data.service';
import { Scroll } from './core/services/scroll';

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
    AuthService,
    HeaderStateService,
    RheodyceDataService,
    Scroll,
  ]
};
