import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Imports de Angular Material para el diálogo
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Interfaz para definir la estructura de los datos que recibimos
export interface DialogData {
  projectName: string;
  veredas: string[];
}

@Component({
  selector: 'app-veredas-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './veredas-dialog.html',
  styleUrls: ['./veredas-dialog.scss'],
})
export class VeredasDialog {
  // Inyectamos los datos que pasamos al abrir el diálogo
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}