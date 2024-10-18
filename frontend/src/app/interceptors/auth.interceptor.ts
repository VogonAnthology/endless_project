import { isPlatformServer } from '@angular/common';
import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { REQUEST, SsrCookieService } from 'ngx-cookie-service-ssr';
import { Observable } from 'rxjs';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    console.log('Request from server:', req);
    if (req.withCredentials) {
      return new Observable((observer) => {
        return observer.complete();
      });
    }
  }
  console.log('Request from browser:', req);

  return next(req);
}
