// src/app/admin/proyectos/proyecto-list/proyecto-list.component.ts

import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subscription, map } from 'rxjs';

import { ProyectoService, Proyecto } from '../../../core/services/proyecto.service';
import { ProyectoForm } from '../proyecto-form/proyecto-form';
import { Modal } from 'bootstrap';
import { Vereda, VeredaService } from '../../../core/services/vereda.service';

/* Angular Material */
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'proyecto-list',
  standalone: true,
  templateUrl: './proyecto-list.html',
  styleUrls: ['./proyecto-list.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    ProyectoForm
],
})
export class ProyectoList implements AfterViewInit, OnDestroy {
  /* --------- Material table --------- */
  displayedColumns: string[] = [
    'nombre',
    'veredas',
    'estado',
    'anioInicio',
    'anioFin',
    'fechaCreacion',
    'acciones',
  ];
  dataSource = new MatTableDataSource<Proyecto>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /* --------- Streams & look-ups --------- */
  proyectos$!: Observable<Proyecto[]>;
  veredasList: Vereda[] = [];

  /* --------- Modal --------- */
  @ViewChild('projectModal', { static: true }) modalEl!: ElementRef;
  private modalInstance!: Modal;

  /* --------- Misc --------- */
  selected?: Proyecto;
  private editSub?: Subscription;

  /* --------- Services --------- */
  private proyectoSvc = inject(ProyectoService);
  private veredaSvc = inject(VeredaService);
  private router = inject(Router);

  constructor() {
    /* 1. Stream para otras partes que sigan usando | async */
    this.proyectos$ = this.proyectoSvc.getAll().pipe(
      map(arr =>
        arr.map(p => ({
          ...p,
          /* normalizo Timestamp → Date para evitar errores de pipes */
          fechaCreacion:
            (p as any).fechaCreacion &&
              typeof (p as any).fechaCreacion.toDate === 'function'
              ? (p as any).fechaCreacion.toDate()
              : p.fechaCreacion,
        }))
      )
    );

    /* 2. Listado de veredas para mostrar nombres legibles */
    this.veredaSvc.getAll().subscribe(v => (this.veredasList = v));
  }

  ngAfterViewInit(): void {
    /* Modal Bootstrap */
    this.modalInstance = new Modal(this.modalEl.nativeElement);

    /* ✅  Usa el stream que YA normaliza fechaCreacion */
    this.proyectos$.subscribe(proyectos => {
      this.dataSource.data = proyectos;        // ← ahora son Date válidos
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    /* Filtro global */
    this.dataSource.filterPredicate = (p, txt) => {
      const term = txt.trim().toLowerCase();

      /* 🔑 convierte ids → nombres */
      const veredasTexto = (p.veredas ?? [])
        .map(id => this.getVeredaName(id).toLowerCase())
        .join(' ');

      return (
        (p.nombre?.toLowerCase().includes(term) ?? false) ||
        veredasTexto.includes(term) ||
        (p.anioInicio?.toString().includes(term) ?? false) ||
        (p.anioFin?.toString().includes(term) ?? false)
      );
    };
  }

  /* ⬇ ahora recibe el texto directo, no el evento */
  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  ngOnDestroy(): void {
    this.editSub?.unsubscribe();
  }


  getVeredaName(id: string): string {
    return this.veredasList.find(v => v.id === id)?.name || id;
  }

  getVeredasDisplay(ids?: string[]): string {
    if (!ids?.length) return '';
    return ids.map(this.getVeredaName.bind(this)).join(', ');
  }

  /* ===========================================================
     = CRUD handlers
     =========================================================== */
  openModal(proy?: Proyecto): void {
    this.selected = proy;
    this.modalInstance.show();
  }

  closeModal(): void {
    this.modalInstance.hide();
  }

  onSaved(): void {
    /* el modal se cierra desde el hijo → refresco en tiempo real */
    this.closeModal();
  }

  editar(id: string): void {
    this.editSub?.unsubscribe();
    this.editSub = this.proyectoSvc.getOne(id).subscribe(p => this.openModal(p));
  }

  eliminar(id: string): void {
    this.proyectoSvc.delete(id);
  }
}
