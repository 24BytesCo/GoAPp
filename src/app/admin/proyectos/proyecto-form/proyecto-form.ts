import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Proyecto, ProyectoService } from '../../../core/services/proyecto.service';
import { Vereda, VeredaService } from '../../../core/services/vereda.service';
import Swal from 'sweetalert2';
import { LoaderService } from '../../../core/services/loader';
import { AuthService } from '../../../core/services/auth.service';
import { map } from 'rxjs';

@Component({
  selector: 'proyecto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './proyecto-form.html',
})
export class ProyectoForm implements OnInit {
  // Inyección de dependencias utilizando el API moderno de Angular
  private fb = inject(FormBuilder);
  private proyectoSvc = inject(ProyectoService);
  public veredaSvc = inject(VeredaService);
  private loaderSvc = inject(LoaderService);
  private authSvc = inject(AuthService);

  proyectoForm: FormGroup;

  // Propiedades para la gestión de imágenes del proyecto
  existingPhotos: string[] = [];
  newFilesToUpload: File[] = [];
  photosToDelete: string[] = [];
  newFilesPreviewUrls: string[] = [];

  private _proyecto?: Proyecto;
  veredasList: Vereda[] = [];

  // Evento emitido al guardar correctamente el formulario
  @Output() formSaved = new EventEmitter<void>();
  @ViewChild('fotos') fileInput!: ElementRef<HTMLInputElement>;

  // Setter para recibir el proyecto a editar. Al cambiar, se actualiza el formulario y el estado de imágenes.
  @Input() set proyecto(valor: Proyecto | undefined) {
    this._proyecto = valor;
    this.resetImageState();

    if (this._proyecto) {
      this.proyectoForm.patchValue(this._proyecto);
      this.existingPhotos = this._proyecto.fotos || [];
    } else {
      this.proyectoForm.reset({
        estado: 'En ejecución',
        anioInicio: new Date().getFullYear(),
      });
    }
  }

  get proyecto(): Proyecto | undefined {
    return this._proyecto;
  }

  constructor() {
    // Inicialización del formulario reactivo con validaciones
    this.proyectoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      veredas: [[], Validators.required],
      estado: ['En ejecución', Validators.required],
      anioInicio: [new Date().getFullYear(), Validators.required],
      anioFin: [null],
      // Las imágenes se gestionan por separado
    });
  }

  ngOnInit(): void {
    this.resetFormState();
    // Carga las veredas para el selector al inicializar el componente
    this.veredaSvc.getAll().subscribe((arr) => {
      this.veredasList = arr;
      console.log("this.veredasList", this.veredasList);

    });
  }

  /**
   * Maneja la selección de archivos para previsualizarlos y almacenarlos temporalmente.
   */
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      const newFiles = Array.from<File>(files);
      this.newFilesToUpload.push(...newFiles);

      // Genera las URLs de previsualización de los nuevos archivos
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newFilesPreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Marca una foto existente para ser eliminada y la remueve de la previsualización.
   */
  markPhotoForDeletion(url: string): void {
    this.photosToDelete.push(url);
    this.existingPhotos = this.existingPhotos.filter(photo => photo !== url);
  }

  /**
   * Elimina una imagen nueva seleccionada antes de subirla.
   */
  removeNewFile(index: number): void {
    this.newFilesToUpload.splice(index, 1);
    this.newFilesPreviewUrls.splice(index, 1);
  }

  /**
   * Envía el formulario para crear o actualizar un proyecto.
   * Incluye la gestión de imágenes (subida/eliminación) y muestra feedback visual.
   */
  async onSubmit(): Promise<void> {
    if (this.proyectoForm.invalid) {
      this.proyectoForm.markAllAsTouched();
      return;
    }
    this.loaderSvc.show();

    try {
      const proyectoId = this.proyecto?.id;
      let successMessage = '';

      if (proyectoId) {
        // Actualiza un proyecto existente, gestionando imágenes nuevas y eliminadas
        const deletePromises = this.photosToDelete.map(url => this.proyectoSvc.deletePhoto(url));
        await Promise.all(deletePromises);

        const newPhotoURLs = await this.proyectoSvc.uploadPhotos(proyectoId, this.newFilesToUpload);
        const updatedPhotos = [...this.existingPhotos, ...newPhotoURLs];

        await this.proyectoSvc.update(proyectoId, {
          ...this.proyectoForm.value,
          fotos: updatedPhotos,
        });
        successMessage = '¡Proyecto actualizado con éxito!';
      } else {
        // Crea un nuevo proyecto, registrando quién y cuándo lo creó
        const proyectoData: Omit<Proyecto, 'id'> = {
          ...this.proyectoForm.value,
          creadoPor: this.authSvc.getCurrentUser()?.email,
          fechaCreacion: new Date(),
          fotos: [],
        };

        const docRef = await this.proyectoSvc.createWithId(proyectoData);
        const photoURLs = await this.proyectoSvc.uploadPhotos(docRef.id, this.newFilesToUpload);
        await this.proyectoSvc.update(docRef.id, { fotos: photoURLs });

        successMessage = '¡Proyecto creado con éxito!';
      }

      // Muestra notificación de éxito
      Swal.fire({
        icon: 'success',
        title: successMessage,
        showConfirmButton: false,
        timer: 1500
      });

      // Notifica al componente padre y resetea el formulario
      this.formSaved.emit();
      this.loaderSvc.hide();
      this.resetFormState();

    } catch (error) {
      // Manejo de errores en la operación de guardado
      this.loaderSvc.hide();
      console.error('Error al guardar el proyecto:', error);
      Swal.fire({ icon: 'error', title: '¡Oops!', text: 'Ocurrió un error al guardar el proyecto.' });
    }
  }

  /**
   * Resetea el estado de las imágenes al cambiar de proyecto o limpiar el formulario.
   */
  private resetImageState(): void {
    this.existingPhotos = [];
    this.newFilesToUpload = [];
    this.photosToDelete = [];
    this.newFilesPreviewUrls = [];
  }

  /**
   * Resetea el formulario a los valores por defecto y limpia las imágenes.
   */
  private resetFormState(): void {
    this.proyectoForm.reset({
      estado: 'En ejecución',
      anioInicio: new Date().getFullYear(),
    });
    this.resetImageState();
    this.resetFileInput();
  }

  resetForm() {
    this.proyectoForm.reset();
  }

  resetFileInput(): void {
    console.log("antes de resetear");
    
    if (this.fileInput?.nativeElement) {
      console.log("reseteando");
      
      this.fileInput.nativeElement.value = '';
    }
  }
}
