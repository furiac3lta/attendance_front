import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];

  constructor(private authSvc: AuthService) {}

  removeRequest(req: HttpRequest<any>) {
    const index = this.requests.indexOf(req);
    if (index >= 0) this.requests.splice(index, 1);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authSvc.getToken();
    let authReq = req;

    // ✅ Clonamos la request solo si hay token
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    this.requests.push(authReq);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Interceptor detectó error HTTP:', error);

        // ⚠️ Solo cerramos sesión si el token expiró o no es válido
        if (error.status === 401) {
          console.warn('🔒 Token expirado o inválido. Cerrando sesión...');
          this.authSvc.logout();
        }

        // 🚫 En cualquier otro error (403, 404, 500, etc.), solo mostramos advertencia
        else {
          console.warn(
            `⚠️ Error HTTP ${error.status}: ${error.error?.message || error.message}`
          );
        }

        return throwError(() => error);
      }),
      finalize(() => this.removeRequest(authReq))
    );
  }
}
