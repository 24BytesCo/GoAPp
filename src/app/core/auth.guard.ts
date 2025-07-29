import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { map, tap } from 'rxjs';

/**
 * AuthGuard: Previene el acceso a rutas si el usuario no está autenticado.
 * Si no hay usuario, redirige automáticamente a la ruta de login (/auth).
 */
export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  return auth.user$.pipe(
    // Convierte el usuario a booleano (true si está autenticado)
    map(u => !!u),
    // Si no está autenticado, redirige al login
    tap(isLogged => {
      if (!isLogged) router.navigate(['/auth']);
    })
  );
};
