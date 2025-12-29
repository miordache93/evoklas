import { InjectionToken } from '@angular/core';

export interface AppEnvironment {
  apiUrl: string;
  production: boolean;
  recaptchaSiteKey?: string;
}

export const APP_ENV = new InjectionToken<AppEnvironment>('APP_ENV');
