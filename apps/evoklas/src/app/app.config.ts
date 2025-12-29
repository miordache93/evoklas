import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appRoutes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import CustomPreset from './theme-preset';
import { APP_ENV, AppEnvironment } from './core/config/environment.tokens';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

const resolvedMode = (
  import.meta.env['NG_APP_ENV'] ??
  import.meta.env['MODE'] ??
  ''
).toString();

const appEnvironment: AppEnvironment = {
  apiUrl: import.meta.env['NG_APP_API_URL'] ?? '',
  production: resolvedMode.toLowerCase() === 'production',
  recaptchaSiteKey: import.meta.env['NG_APP_RECAPTCHA_KEY'] ?? '',
};

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: CustomPreset,
      },
    }),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'ro',
        useDefaultLang: true,
        fallbackLang: 'ro',
      })
    ),
    ...provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
    { provide: APP_ENV, useValue: appEnvironment },
  ],
};
