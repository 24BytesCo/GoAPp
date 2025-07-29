import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, addDoc, doc,
  updateDoc, deleteDoc, docData, setDoc,
} from '@angular/fire/firestore';
import {
  Storage, ref, uploadBytes, getDownloadURL, deleteObject,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

/**
 * Modelo de Proyecto almacenado en Firestore
 */
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
  private fs = inject(Firestore);
  private storage = inject(Storage);
  private col = collection(this.fs, 'proyectos');

  // --- MÉTODOS DE FIRESTORE ---

  /**
   * Obtiene todos los proyectos en tiempo real.
   */
  getAll(): Observable<Proyecto[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<Proyecto[]>;
  }

  /**
   * Obtiene un proyecto específico por su ID.
   */
  getOne(id: string): Observable<Proyecto> {
    const d = doc(this.fs, `proyectos/${id}`);
    return docData(d, { idField: 'id' }) as Observable<Proyecto>;
  }

  /**
   * Crea un nuevo proyecto y asigna un ID personalizado.
   */
  createWithId(data: Partial<Proyecto>) {
    const newDocRef = doc(this.col);
    const dataToCreate = { ...data, id: newDocRef.id, fechaCreacion: new Date() };
    setDoc(newDocRef, dataToCreate);
    return Promise.resolve(newDocRef);
  }

  /**
   * Actualiza un proyecto existente.
   */
  update(id: string, data: Partial<Proyecto>) {
    return updateDoc(doc(this.fs, `proyectos/${id}`), data);
  }

  /**
   * Elimina un proyecto por su ID.
   * Nota: se recomienda también eliminar las fotos asociadas.
   */
  delete(id: string) {
    return deleteDoc(doc(this.fs, `proyectos/${id}`));
  }

  // --- MÉTODOS DE STORAGE ---

  /**
   * Sube varias fotos y retorna las URLs públicas resultantes.
   */
  async uploadPhotos(proyectoId: string, files: File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const filePath = `proyectos/${proyectoId}/${Date.now()}_${file.name}`;
      const fileRef = ref(this.storage, filePath);
      await uploadBytes(fileRef, file);
      return getDownloadURL(fileRef);
    });
    return Promise.all(uploadPromises);
  }

  /**
   * Elimina una foto de Firebase Storage a partir de su URL.
   */
  deletePhoto(url: string): Promise<void> {
    // Extrae la referencia de archivo desde la URL completa
    const fileRef = ref(this.storage, url);
    return deleteObject(fileRef);
  }
}
