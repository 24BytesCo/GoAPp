import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * HeaderComponent: Encabezado principal de la aplicación.
 * Muestra información del usuario autenticado y permite cerrar sesión.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  // Servicio de autenticación inyectado
  private auth = inject(AuthService);
  public router = inject(Router);

  // Observable del usuario autenticado
  user$ = this.auth.user$;

  /**
   * Cierra la sesión y redirige al usuario al login.
   */
  logout() { 
    this.auth.logout(); 
    console.log('User logged out');
    this.auth.redirectAfterLogout();
  }

  login(){
    this.router.navigate(['/auth']);
  }
}
