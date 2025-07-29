import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

/**
 * Modelo de Vereda almacenado en Firestore.
 */
export interface Vereda {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class VeredaService {
  // Inyección de Firestore y referencia a la colección de veredas.
  private fs = inject(Firestore);
  private col = collection(this.fs, 'veredas');

  /**
   * Devuelve todas las veredas almacenadas en Firestore, incluyendo su id.
   */
  getAll(): Observable<Vereda[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<Vereda[]>;
  }
}
