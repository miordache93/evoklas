import { Injectable, inject } from '@angular/core';
import {
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
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const { production, apiUrl } = this.env;
    const isApiCall = req.url.startsWith('/api') || req.url.includes('/api/');

    if (production && apiUrl && isApiCall) {
      req = req.clone({ url: apiUrl + req.url });
    }

    return next.handle(req);
  }
}
