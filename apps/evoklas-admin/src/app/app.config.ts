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
import { LayoutModule } from '@angular/cdk/layout';
import { appRoutes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
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
};

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: CustomPreset,
      },
    }),
    MessageService,
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    ...authInterceptorProviders,
    ...httpRequestInterceptorProviders,
    importProvidersFrom(LayoutModule),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        useDefaultLang: true,
        fallbackLang: 'en',
      })
    ),
    ...provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
    { provide: APP_ENV, useValue: appEnvironment },
  ],
};
