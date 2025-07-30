// src/app/admin/proyectos/proyecto-list/proyecto-list.component.ts

import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';

import { ProyectoService, Proyecto } from '../../../core/services/proyecto.service';
import { ProyectoForm } from '../proyecto-form/proyecto-form';
import { Modal } from 'bootstrap';
import { Vereda, VeredaService } from '../../../core/services/vereda.service';

@Component({
  selector: 'proyecto-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ProyectoForm],
  templateUrl: './proyecto-list.html',
  styleUrls: ['./proyecto-list.scss'],
})
export class ProyectoList implements AfterViewInit, OnDestroy {
  /** Stream de proyectos desde Firestore */
  proyectos$!: Observable<Proyecto[]>;
  private editSub?: Subscription;
  /** Proyecto seleccionado para edición */
  selected?: Proyecto;

  /** Referencia al elemento modal de Bootstrap */
  @ViewChild('projectModal', { static: true }) modalEl!: ElementRef;

  private modalInstance!: any;
  veredasList: Vereda[] = [];

  /** Inyecciones */
  private proyectoSvc = inject(ProyectoService);
  private veredaSvc = inject(VeredaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  formSaved: boolean = false;
  constructor() {
    this.proyectos$ = this.proyectoSvc.getAll().pipe(
      map(proyectos => proyectos.map(p => {
        // Usamos '(p as any)' para poder acceder al método .toDate() sin que TypeScript se queje.
        const fecha = (p as any).fechaCreacion;

        if (fecha && typeof fecha.toDate === 'function') {
          // Creamos una nueva propiedad 'fechaCreacion' del tipo correcto (Date)
          return { ...p, fechaCreacion: fecha.toDate() };
        }

        // Si no es un Timestamp, lo devolvemos como está.
        return p;
      }))
    );
    // Suscríbete a la lista de veredas para hacer lookup
    this.veredaSvc.getAll().subscribe((arr) => {
      this.veredasList = arr;
    });
  }

  ngAfterViewInit() {
    // Inicializo el modal de Bootstrap
    this.modalInstance = new Modal(this.modalEl.nativeElement);
  }

  /** Abre modal para nuevo o edición */
  openModal(proy?: Proyecto) {
    console.log("proy", proy);

    this.selected = proy;
    this.modalInstance.show();
  }

  /** Cierra el modal */
  closeModal() {
    this.modalInstance.hide();
  }

  /** Callback cuando el formulario emite 'saved' */
  onSaved() {
    this.closeModal();
    // La lista se refresca automáticamente (Firestore emite cambios en tiempo real)
  }

  editar(id: string) {
    // Si ya hay una suscripción previa, la destruimos
    this.editSub = this.proyectoSvc.getOne(id).subscribe((p) => {
      this.openModal(p);
    });
  }

  /** Eliminar proyecto */
  eliminar(id: string) {
    this.proyectoSvc.delete(id);
  }
  getVeredaName(id: string): string {

    return this.veredasList.find((v) => v.id === id)?.name || id;
  }
  getVeredasDisplay(veredas?: string[]): string {

    if (!veredas || !Array.isArray(veredas)) return '';
    return veredas.map((id) => this.getVeredaName(id)).join(', ');
  }

  ngOnDestroy() {
    this.editSub?.unsubscribe();
  }

}
