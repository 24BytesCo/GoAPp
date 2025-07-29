// src/app/admin/proyectos/proyecto-form/proyecto-form.component.ts
import {
  Component,
  inject,
  OnInit,
  EventEmitter,
  Output,
  Input,
  Type,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProyectoService, Proyecto } from '../proyecto.service';
import { switchMap, tap, of, Observable, firstValueFrom } from 'rxjs';
import { Vereda, VeredaService } from '../vereda.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthService } from '../../../core/auth.service';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, doc, Firestore } from '@angular/fire/firestore';
import { Storage as FirebaseStorage } from '@angular/fire/storage';
@Component({
  selector: 'proyecto-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule],
  templateUrl: './proyecto-form.html',
  styleUrls: ['./proyecto-form.scss'],
})
export class ProyectoForm implements OnInit {
  @Input() proyecto?: Proyecto; // si viene, es edición
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private svc = inject(ProyectoService);
  private veredaService = inject(VeredaService);
  // private storage = inject(Storage);
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private storage = inject(FirebaseStorage); // ✅ ahora sí es FirebaseStorage

  previewUrls: string[] = []; // Para mostrar thumbnails
  private filesToUpload: File[] = [];

  veredas$: Observable<Vereda[]> = this.veredaService.getAll();

form = this.fb.nonNullable.group({
  nombre:        ['', Validators.required],
  descripcion:   ['', Validators.required],
  veredas:       this.fb.nonNullable.control<string[]>([], Validators.required),
  estado:        this.fb.nonNullable.control<'En ejecución'|'Finalizado'|'Suspendido'>('En ejecución', Validators.required),
  anioInicio:    this.fb.nonNullable.control<number>(new Date().getFullYear(), Validators.required),
  anioFin:       this.fb.control<number | null>(null),   // este sí admite null
  fotos:         this.fb.nonNullable.control<string[]>([]),
});

  static commonModule: readonly any[] | Type<any>;
  isEdit: any;

  ngOnInit() {
    if (this.proyecto) {
      const { anioFin, ...rest } = this.proyecto;
      this.form.patchValue({
        ...rest,
        anioFin: typeof anioFin === 'number' ? null : anioFin ?? null,
      });
    }
  }

  cancel() {
    this.cancelled.emit();
  }

  async submit() {
    if (this.form.invalid) {
      return;
    }

    // Datos base
    const user = await firstValueFrom(this.auth.user$);
    const base: Proyecto = {
      ...this.form.getRawValue(),
      creadoPor: user?.email ?? null,
      fechaCreacion: new Date(),
      fotos: [], // aún sin URLs
    };

    // 1️⃣ Crea (o actualiza) sin fotos y obtén el id
    const id =
      this.proyecto?.id ?? doc(collection(this.firestore, 'proyectos')).id;

    if (this.proyecto?.id) {
      await this.svc.update(id, base);
    } else {
      await this.svc.createWithId(id, base); // adapta tu servicio para admitir id externo
    }

    // 2️⃣ Sube imágenes si las hay
    if (this.filesToUpload.length) {
      const uploadPromises = this.filesToUpload.map(async (file) => {
        const path = `proyectos/${id}/${Date.now()}_${file.name}`;
        const storageRef = ref(this.storage, path);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef); // ← URL pública
      });

      const urls = await Promise.all(uploadPromises);

      // 3️⃣ Actualiza el documento con las URLs
      await this.svc.update(id, { fotos: urls });
    }

    this.saved.emit();
  }

  onFilesSelected(evt: Event) {
    const files = (evt.target as HTMLInputElement).files;
    if (!files?.length) {
      return;
    }

    // Guarda los archivos en memoria hasta que el usuario pulse "Guardar"
    this.filesToUpload.push(...Array.from(files));

    // Pre-views (opcional)
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrls.push(e.target?.result as string);
      reader.readAsDataURL(f);
    });
  }
}
