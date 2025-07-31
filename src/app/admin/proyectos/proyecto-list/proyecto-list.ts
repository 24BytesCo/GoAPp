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
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // <-- AÑADIDO

/* Componente de diálogo para veredas */
import { VeredasDialog } from '../veredas-dialog/veredas-dialog';

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
    ProyectoForm,
    MatDialogModule, 
    VeredasDialog, 
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
  public dialog = inject(MatDialog); // <-- AÑADIDO

  constructor() {
    this.proyectos$ = this.proyectoSvc.getAll().pipe(
      map(arr =>
        arr.map(p => ({
          ...p,
          fechaCreacion:
            (p as any).fechaCreacion &&
            typeof (p as any).fechaCreacion.toDate === 'function'
              ? (p as any).fechaCreacion.toDate()
              : p.fechaCreacion,
        }))
      )
    );
    this.veredaSvc.getAll().subscribe(v => (this.veredasList = v));
  }

  ngAfterViewInit(): void {
    this.modalInstance = new Modal(this.modalEl.nativeElement);
    this.proyectos$.subscribe(proyectos => {
      this.dataSource.data = proyectos;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    this.dataSource.filterPredicate = (p, txt) => {
      const term = txt.trim().toLowerCase();
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

  // Esta función ya no es necesaria, pero no hace daño dejarla
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
    this.closeModal();
  }

  editar(id: string): void {
    this.editSub?.unsubscribe();
    this.editSub = this.proyectoSvc.getOne(id).subscribe(p => this.openModal(p));
  }

  eliminar(id: string): void {
    this.proyectoSvc.delete(id);
  }

  /**
   * Abre un diálogo modal para mostrar la lista completa de veredas.
   * @param veredas - El arreglo completo de IDs de las veredas.
   * @param projectName - El nombre del proyecto para mostrarlo en el título.
   */
  verVeredas(veredas: string[], projectName: string): void {
    this.dialog.open(VeredasDialog, {
      width: '450px',
      data: {
        projectName: projectName,
        // Usamos tu función getVeredaName para pasar la lista de nombres
        veredas: veredas.map(v => this.getVeredaName(v)) 
      }
    });
  }
}