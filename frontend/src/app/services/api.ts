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
export class Api {
  // Usar proxy CORS - ELIGE UNA OPCIÓN:

  // Opción A: Proxy CORS público
  private proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  private apiUrl = 'https://ja-grad-logros.gt.tc/api';
  
  // Opción B: Otro proxy alternativo
  // private proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
  
  // Opción C: Sin proxy (para probar si CORS ya funciona)
  // private apiUrl = 'https://ja-grad-logros.gt.tc/api';

  constructor(private http: HttpClient) { }

  guardarPersona(persona: Persona): Observable<ApiResponse> {
    // Con proxy
    return this.http.post<ApiResponse>(`${this.proxyUrl}${this.apiUrl}/guardar_persona.php`, persona);
    
    // Sin proxy (cuando CORS funcione)
    // return this.http.post<ApiResponse>(`${this.apiUrl}/guardar_persona.php`, persona);
  }

  obtenerArbol(): Observable<ApiResponse> {
    // Con proxy
    return this.http.get<ApiResponse>(`${this.proxyUrl}${this.apiUrl}/obtener_arbol.php`);
    
    // Sin proxy (cuando CORS funcione)
    // return this.http.get<ApiResponse>(`${this.apiUrl}/obtener_arbol.php`);
  }
}