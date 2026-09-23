import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Avoid the browser restoring a previous page's scroll position before Angular
// has rendered the new route (the footer can otherwise flash at the top).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
