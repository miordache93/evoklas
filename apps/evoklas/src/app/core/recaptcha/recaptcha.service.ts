import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { APP_ENV } from '../config/environment.tokens';

type GrecaptchaExecutor = {
  ready: (callback: () => void) => void;
  execute: (
    siteKey: string,
    options: { action: string }
  ) => Promise<string>;
};

type Grecaptcha = {
  ready?: (callback: () => void) => void;
  execute?: (
    siteKey: string,
    options: { action: string }
  ) => Promise<string>;
  enterprise?: GrecaptchaExecutor;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService {
  private readonly env = inject(APP_ENV);
  private scriptLoading?: Promise<void>;

  execute(action: string): Observable<string> {
    const siteKey = this.env.recaptchaSiteKey ?? '';

    if (!siteKey) {
      return defer(() =>
        Promise.reject(new Error('Missing reCAPTCHA site key'))
      );
    }

    return defer(() =>
      this.loadScript(siteKey).then(() => this.executeAction(siteKey, action))
    );
  }

  private loadScript(siteKey: string): Promise<void> {
    if (window.grecaptcha) {
      return Promise.resolve();
    }

    if (this.scriptLoading) {
      return this.scriptLoading;
    }

    this.scriptLoading = new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById('recaptcha-v3-script');
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'recaptcha-v3-script';
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Failed to load reCAPTCHA script'));
      document.head.appendChild(script);
    });

    return this.scriptLoading;
  }

  private executeAction(siteKey: string, action: string): Promise<string> {
    const grecaptcha = window.grecaptcha;

    if (!grecaptcha) {
      return Promise.reject(new Error('reCAPTCHA is not available'));
    }

    const executor = grecaptcha.enterprise?.ready
      ? grecaptcha.enterprise
      : grecaptcha.ready && grecaptcha.execute
        ? (grecaptcha as GrecaptchaExecutor)
        : undefined;

    if (!executor) {
      return Promise.reject(
        new Error('reCAPTCHA is not available for this key')
      );
    }

    return new Promise((resolve, reject) => {
      executor.ready(() => {
        executor.execute(siteKey, { action }).then(resolve).catch(reject);
      });
    });
  }
}
