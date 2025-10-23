import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArbolLogros } from './components/arbol-logros/arbol-logros';
import { FormularioPersona } from './components/formulario-persona/formulario-persona';

@Component({
  selector: 'app-root',
  imports: [ArbolLogros, FormularioPersona],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('logros');

  onPersonaGuardada(): void {
    // Recargar el árbol cuando se guarda una nueva persona
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}
