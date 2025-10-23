import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
export class Api {//
  //https://ja-grad-logros.gt.tc/api/guardar_persona.php
  private apiUrl = 'https://ja-grad-logros.gt.tc/api';

  constructor(private http: HttpClient) { }

  guardarPersona(persona: Persona): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/guardar_persona.php`, persona);
  }

  obtenerArbol(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/obtener_arbol.php`);
  }
}