import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Api, Persona } from '../../services/api';

@Component({
  selector: 'app-formulario-persona',
  templateUrl: './formulario-persona.html',
  styleUrls: ['./formulario-persona.scss'],
  imports: [ReactiveFormsModule]
})
export class FormularioPersona {
  @Output() personaGuardada = new EventEmitter<void>();
  
  personaForm: FormGroup;
  enviado = false;
  guardando = false;

  constructor(private fb: FormBuilder, private apiService: Api) {
    this.personaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      logros: this.fb.array([this.crearLogroFormGroup()])
    });
  }

  get logros(): FormArray {
    return this.personaForm.get('logros') as FormArray;
  }

  crearLogroFormGroup(): FormGroup {
    return this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['']
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

  onSubmit(): void {
    this.enviado = true;
    
    if (this.personaForm.valid && !this.guardando) {
      this.guardando = true;
      const personaData: Persona = this.personaForm.value;
      
      this.apiService.guardarPersona(personaData).subscribe({
        next: (response) => {
          console.log('Persona guardada:', response);
          if (response.success) {
            this.personaForm.reset();
            this.logros.clear();
            this.logros.push(this.crearLogroFormGroup());
            this.enviado = false;
            this.personaGuardada.emit();
            alert('¡Persona y logros guardados exitosamente!');
          } else {
            alert('Error: ' + response.message);
          }
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al guardar los datos. Verifica la conexión con el servidor.');
          this.guardando = false;
        }
      });
    }
  }
}