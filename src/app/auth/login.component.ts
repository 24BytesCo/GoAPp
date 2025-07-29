import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import Swal from 'sweetalert2';

/**
 * LoginComponent: formulario de inicio de sesión.
 * Permite autenticarse con email y contraseña usando un diseño agradable.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="card shadow p-4" style="min-width: 340px; max-width: 370px;">
        <h2 class="mb-3 text-center">Iniciar sesión</h2>
        <form [formGroup]="fm" (ngSubmit)="ingresar()" autocomplete="off">
          <div class="mb-3">
            <input 
              formControlName="email" 
              placeholder="Correo electrónico"
              type="email"
              class="form-control"
              [class.is-invalid]="fm.get('email')?.invalid && fm.get('email')?.touched"
              autofocus
            >
            <div *ngIf="fm.get('email')?.invalid && fm.get('email')?.touched" class="invalid-feedback">
              Ingresa un correo válido.
            </div>
          </div>
          <div class="mb-3">
            <input 
              formControlName="pw" 
              placeholder="Contraseña"
              type="password"
              class="form-control"
              [class.is-invalid]="fm.get('pw')?.invalid && fm.get('pw')?.touched"
            >
            <div *ngIf="fm.get('pw')?.invalid && fm.get('pw')?.touched" class="invalid-feedback">
              La contraseña es obligatoria.
            </div>
          </div>
          <button 
            class="btn btn-primary w-100"
            type="submit"
            [disabled]="fm.invalid"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    body, html { height: 100%; }
    .card { border-radius: 1.5rem; }
    .form-control:focus { box-shadow: 0 0 0 2px #0d6efd33; }
  `]
})
export class LoginComponent {
  // Inyección de dependencias: FormBuilder, AuthService y Router
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Formulario reactivo con validaciones
  fm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    pw: ['', Validators.required]
  });

  /**
   * Intenta iniciar sesión con las credenciales del formulario.
   * Muestra notificación visual de error si falla.
   */
  ingresar() {
    if (this.fm.invalid) {
      this.fm.markAllAsTouched();
      return;
    }

    const { email, pw } = this.fm.getRawValue();
    this.auth.login(email, pw)
      .then(() => {
        this.router.navigate(['/admin/proyectos']);
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Ingreso exitoso.',
          timer: 1200,
          showConfirmButton: false
        });
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: err?.message ?? 'Verifica tus credenciales e inténtalo de nuevo.'
        });
      });
  }
}
