import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Logro {
  titulo: string;
  descripcion: string;
  categoria: string;
  fecha_logro: string;
  nivel: number;
  padre_id?: number;
}

export interface Persona {
  nombre: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  logros: Logro[];
}

@Injectable({
  providedIn: 'root'
})
export class Api {
  private apiUrl = 'http://localhost/backend/api';

  constructor(private http: HttpClient) { }

  guardarPersona(persona: Persona): Observable<any> {
    return this.http.post(`${this.apiUrl}/guardar_persona.php`, persona);
  }

  obtenerArbol(): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtener_arbol.php`);
  }
}