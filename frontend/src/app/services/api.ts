import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Logro {
  titulo: string;
  descripcion: string;
}

export interface Persona {
  nombre: string;
  logros: Logro[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class Api {
  // Usar cors-anywhere pero con los headers requeridos
  private proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  private apiBaseUrl = 'https://ja-grad-logros.gt.tc/api';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpHttpRequest', // Header requerido
      'Origin': 'https://arbol-logros.vercel.app' // Header requerido
    })
  };

  constructor(private http: HttpClient) { }

  guardarPersona(persona: Persona): Observable<ApiResponse> {
    const url = `${this.apiBaseUrl}/guardar_persona.php`;
    return this.http.post<ApiResponse>(url, persona, this.httpOptions);
  }

  obtenerArbol(): Observable<ApiResponse> {
    const url = `${this.apiBaseUrl}/obtener_arbol.php`;
    return this.http.get<ApiResponse>(url, this.httpOptions);
  }
}