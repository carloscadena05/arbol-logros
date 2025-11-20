import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Api, Persona } from '../../services/api';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-formulario-persona',
  templateUrl: './formulario-persona.html',
  styleUrls: ['./formulario-persona.scss'],
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, RouterLink, MatSnackBarModule]
})
export class FormularioPersona {
  @Output() personaGuardada = new EventEmitter<void>();

  personaForm: FormGroup;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private apiService: Api,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.personaForm = this.fb.group({
      nombre: ['', [Validators.required]],
      logros: this.fb.array([this.crearLogroFormGroup()])
    });
  }

  get logros(): FormArray {
    return this.personaForm.get('logros') as FormArray;
  }

  crearLogroFormGroup(): FormGroup {
    return this.fb.group({
      titulo: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      desafio: ['', [Validators.required]]
    });
  }

  agregarLogro(): void {
    this.logros.push(this.crearLogroFormGroup());
  }

  eliminarLogro(index: number): void {
    if (this.logros.length > 1) {
      this.logros.removeAt(index);
    }
  }

  getLogroControls() {
    return (this.personaForm.get('logros') as FormArray).controls;
  }

  async onSubmit(): Promise<void> {
    if (this.personaForm.valid) {
      this.guardando = true;
      const personaData: Persona = this.personaForm.value;

      try {
        const response = await this.apiService.guardarPersona(personaData);
        console.log('Persona guardada:', response);

        if (response.success) {
          this.personaForm.reset();
          this.logros.clear();
          this.logros.push(this.crearLogroFormGroup());
          this.personaGuardada.emit();
          this.snack.open('¡Persona y logros guardados exitosamente!', 'Cerrar', { duration: 5000, panelClass: '*:text-green-500' });
          this.router.navigate(['tree'])
        } else {
          this.snack.open('Error: ' + response.message, 'Cerrar', { duration: 5000, panelClass: '*:text-red-500' });
        }
      } catch (error) {
        console.error('Error:', error);
        this.snack.open('Error al guardar los datos. Verifica la conexión con el servidor.', 'Cerrar', { duration: 5000, panelClass: '*:text-red-500' });
      } finally {
        this.guardando = false;
      }
    } /* else {
      // Marcar todos los campos como touched para mostrar errores
      this.marcarCamposInvalidosComoTouched();
    } */
  }

  private marcarCamposInvalidosComoTouched(): void {
    // Marcar el campo nombre solo si es inválido
    const nombreControl = this.personaForm.get('nombre');
    if (nombreControl && nombreControl.invalid) {
      nombreControl.markAsTouched();
    }

    // Marcar solo los campos inválidos de los logros
    const logrosArray = this.personaForm.get('logros') as FormArray;
    logrosArray.controls.forEach((logroGroup: AbstractControl) => {
      Object.keys((logroGroup as FormGroup).controls).forEach(controlName => {
        const control = logroGroup.get(controlName);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
    });
  }


}