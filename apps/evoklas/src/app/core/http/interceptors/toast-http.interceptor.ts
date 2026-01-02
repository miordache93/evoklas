import { Injectable, inject } from '@angular/core';
import {
  HttpContextToken,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { MessageService } from 'primeng/api';

/**
 * Context token to opt-out from showing toasts for a request.
 * Useful for polling/interval/background requests.
 */
export const SKIP_TOAST = new HttpContextToken<boolean>(() => false);

@Injectable()
export class ToastHttpInterceptor implements HttpInterceptor {
  private readonly messageService = inject(MessageService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const skipToast =
      req.context.get(SKIP_TOAST) ||
      /poll|interval/i.test(req.url); // basic opt-out for interval calls

    const method = req.method?.toUpperCase();
    const isMutating =
      method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

    if (skipToast || !isMutating) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            this.messageService.add({
              severity: 'success',
              summary: 'Succes',
              detail: 'Operațiunea s-a finalizat.',
              life: 2500,
            });
          }
        },
        error: (error) => {
          const detail =
            error?.error?.message ||
            error?.message ||
            'A apărut o eroare la procesarea solicitării.';
          this.messageService.add({
            severity: 'error',
            summary: 'Eroare',
            detail,
            life: 4000,
          });
        },
      })
    );
  }
}

export const toastHttpInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ToastHttpInterceptor,
  multi: true,
};
