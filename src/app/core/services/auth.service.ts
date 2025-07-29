import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Inyección de dependencias con API moderna de Angular
  private auth = inject(Auth);
  private router = inject(Router);

  /**
   * Observable del estado de autenticación del usuario.
   * Se puede usar en componentes para mostrar u ocultar vistas según el login.
   */
  readonly user$: Observable<any> = authState(this.auth);

  /**
   * Redirecciona al usuario después de hacer logout.
   * Aquí puedes personalizar la navegación post-logout.
   */
  redirectAfterLogout() {
    console.log('Redirecting after logout...');
    this.router.navigate(['/auth']);
  }

  /**
   * Realiza el inicio de sesión con email y contraseña.
   * Devuelve una promesa del usuario autenticado.
   */
  login(email: string, pw: string) {
    return signInWithEmailAndPassword(this.auth, email, pw);
  }

  /**
   * Realiza el cierre de sesión.
   */
  logout() {
    return signOut(this.auth);
  }

  /**
   * Devuelve el usuario autenticado actualmente (si existe).
   * Puede ser 'null' si no hay sesión iniciada o el SDK aún no ha cargado.
   * Si no hay usuario, redirecciona automáticamente al login.
   */
  getCurrentUser(): User | null {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      this.router.navigate(['/auth']);
      return null;
    }
    return currentUser;
  }
}
