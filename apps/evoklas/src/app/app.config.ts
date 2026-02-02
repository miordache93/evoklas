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
import { ConfirmationService, MessageService } from 'primeng/api';
import CustomPreset from './theme-preset';
import { APP_ENV, AppEnvironment } from './core/config/environment.tokens';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { authInterceptorProviders } from './core/auth/interceptors/auth.interceptor';
import { httpRequestInterceptorProviders } from './core/http/interceptors/http-request.interceptor';

const metaEnv =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : {};

const hardcodedApiUrl = 'https://test-pa-api.ikidevelopers.com';

const resolvedMode = (metaEnv['NG_APP_ENV'] ?? metaEnv['MODE'] ?? 'production')
  .toString()
  .toLowerCase();

const appEnvironment: AppEnvironment = {
  apiUrl: metaEnv['NG_APP_API_URL'] ?? hardcodedApiUrl,
  production: resolvedMode === 'production',
  recaptchaSiteKey:
    metaEnv['NG_APP_RECAPTCHA_KEY'] ??
    '6LcP334fAAAAACpw1Rd_eyaTQoPsL_RugbBHi0Ro',
};

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: CustomPreset,
      },
    }),
    ConfirmationService,
    MessageService,
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    ...authInterceptorProviders,
    ...httpRequestInterceptorProviders,
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
