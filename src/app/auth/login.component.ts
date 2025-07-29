import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Iniciar sesión</h2>
    <form [formGroup]="fm" (ngSubmit)="ingresar()">
      <input formControlName="email" placeholder="Correo" type="email">
      <input formControlName="pw" placeholder="Contraseña" type="password">
      <button type="submit">Entrar</button>
    </form>
    <p *ngIf="error" class="err">{{ error }}</p>
  `,
  styles:[`.err{color:red}`]
})
export class LoginComponent {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  fm = this.fb.nonNullable.group({ email:'', pw:'' });
  error = '';

  ingresar() {
    const {email, pw} = this.fm.getRawValue();
    this.auth.login(email, pw)
      .then(() => this.router.navigate(['/admin/proyectos']))
      .catch(err => this.error = err.message);
  }
}
