import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from "../shared/header/header";
import { Loader } from "../shared/loader/loader";

/**
 * LayoutComponent: estructura principal de la app.
 * Incluye loader, header y el área central para las rutas hijas.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, Loader],
  template: `
    <app-loader></app-loader>
    <app-header></app-header>
<main class="container-fluid my-4" style="padding-left: 30px; padding-right: 30px;">
  <router-outlet></router-outlet>
</main>
  `,
  styles: []
})
export class LayoutComponent {
  // Servicio de autenticación inyectado
  private auth = inject(AuthService);

  // Observable del usuario autenticado
  user$ = this.auth.user$;

  /**
   * Cierra la sesión del usuario.
   */
  logout() {
    this.auth.logout();
  }
}
