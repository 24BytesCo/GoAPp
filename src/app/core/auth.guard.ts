import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, tap } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  return auth.user$.pipe(
    map(u => !!u),
    tap(isLogged => {
      if (!isLogged) router.navigate(['/auth']);
    })
  );
};
