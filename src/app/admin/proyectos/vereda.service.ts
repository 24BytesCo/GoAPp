// src/app/admin/proyectos/vereda.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Vereda {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class VeredaService {
  private fs = inject(Firestore);
  private col = collection(this.fs, 'veredas');

  /** devuelve todas las veredas con su id */
  getAll(): Observable<Vereda[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<Vereda[]>;
  }

}
