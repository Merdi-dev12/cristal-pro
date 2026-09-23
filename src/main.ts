import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Avoid the browser restoring a previous page's scroll position before Angular
// has rendered the new route (the footer can otherwise flash at the top).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
// A refresh always starts at the hero; section fragments remain usable for
// in-app navigation but do not restore a previous scroll target on reload.
if (location.hash) {
  history.replaceState(history.state, document.title, `${location.pathname}${location.search}`);
  window.scrollTo(0, 0);
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
