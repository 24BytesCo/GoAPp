// proyecto.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  docData,
  setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Proyecto {
  id?: string;
  nombre: string;
  descripcion: string;
  veredas: string[];
  estado: 'En ejecución' | 'Finalizado' | 'Suspendido';
  anioInicio: number;
  anioFin?: number | null;
  fotos: string[];
  creadoPor: string | null;
  fechaCreacion: Date;
}

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  createWithId(id: any, base: Proyecto) {
    const ref = doc(this.fs, 'proyectos', id);
    return setDoc(ref, base);
  }
  private fs = inject(Firestore);
  private col = collection(this.fs, 'proyectos');

  getAll(): Observable<Proyecto[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<
      Proyecto[]
    >;
  }

  create(data: Proyecto) {
    return addDoc(this.col, data);
  }

  update(id: string, data: Partial<Proyecto>) {
    return updateDoc(doc(this.fs, `proyectos/${id}`), data);
  }

  delete(id: string) {
    return deleteDoc(doc(this.fs, `proyectos/${id}`));
  }
  getOne(id: string) {
    const d = doc(this.fs, `proyectos/${id}`);
    return docData(d, { idField: 'id' }) as Observable<Proyecto>;
  }
}
