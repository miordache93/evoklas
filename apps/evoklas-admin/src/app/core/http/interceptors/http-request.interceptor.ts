import { inject, Injectable } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_ENV } from '../../config/environment.tokens';

@Injectable({
  providedIn: 'root',
})
export class HttpRequestInterceptor implements HttpInterceptor {
  private readonly env = inject(APP_ENV);
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const { production, apiUrl } = this.env;
    const isApiCall = req.url.startsWith('/api') || req.url.includes('/api/');

    if (production && apiUrl && isApiCall) {
      req = req.clone({
        url: apiUrl + req.url,
      });
    }

    return next.handle(req);
  }
}

export const httpRequestInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
