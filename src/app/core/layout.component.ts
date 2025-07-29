import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { HeaderComponent } from "../shared/header/header";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
<app-header></app-header>
<main class="container my-4">
  <router-outlet></router-outlet>
</main>
  `,
  styles: []
})
export class LayoutComponent {
  private auth = inject(AuthService);
  user$ = this.auth.user$;
  logout() { this.auth.logout(); }
}
