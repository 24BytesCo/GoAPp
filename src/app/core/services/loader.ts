import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  /**
   * BehaviorSubject que mantiene el estado actual del loader.
   * Inicialmente en 'false' (loader oculto).
   */
  private isLoading = new BehaviorSubject<boolean>(false);

  /**
   * Observable expuesto para que otros componentes puedan suscribirse
   * y reaccionar a los cambios del estado del loader.
   */
  public readonly isLoading$ = this.isLoading.asObservable();

  /**
   * Muestra el loader (cambia el estado a true).
   */
  show(): void {
    this.isLoading.next(true);
  }

  /**
   * Oculta el loader (cambia el estado a false).
   */
  hide(): void {
    this.isLoading.next(false);
  }
}
