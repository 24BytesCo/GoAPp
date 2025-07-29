import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { APP_ROUTES } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';

/**
 * Configuración global de la aplicación Angular.
 * Provee rutas, Firebase, manejo de errores, HTTP e intercepción de carga.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Listeners globales para errores y optimización de detección de cambios
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Configuración de rutas principales
    provideRouter(APP_ROUTES),

    // Proveedor de HTTP con interceptor para mostrar el loader global
    provideHttpClient(
      withInterceptors([loadingInterceptor])
    ),

    // --- Inicialización de Firebase y sus módulos ---
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()), 
    provideFirestore(() => getFirestore()),
  ]
};
