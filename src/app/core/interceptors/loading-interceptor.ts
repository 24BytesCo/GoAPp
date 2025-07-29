import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader';

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  
  const loaderService = inject(LoaderService);

  // Muestra el loader antes de que la petición inicie
  loaderService.show();

  // Usa el pipe 'finalize' para asegurarte de que el loader se oculte
  // sin importar si la petición fue exitosa o falló.
  return next(req).pipe(
    finalize(() => loaderService.hide())
  );
};
