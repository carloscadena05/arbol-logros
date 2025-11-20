import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProviderService } from './provider.service';
import { LogroDesafio } from '../components/arbol-logros/arbol-logros';

export interface Logro {
  titulo: string;
  descripcion: string;
}

export interface IP {
  "success":boolean;
  "local_ip":string;
  "server_os":string;
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

  PROTOCOL = typeof window !== 'undefined' ? window.location.protocol : 'http:'; // Asigna un valor por defecto para Node.js
  DOMINIO = typeof window !== 'undefined' ? window.location.hostname : 'localhost'; // Asigna un valor por defecto para Node.js
  ACCESS = 'public'
  WSERVICE = '/api';
  // WSERVICE = 'ws-arbol/api';

  constructor(private provider: ProviderService) { }

  async guardarPersona(persona: Persona): Promise<ApiResponse> {
    const url = this.PROTOCOL + '//' + this.DOMINIO + '/' + this.WSERVICE + '/';
    console.log(persona);

    const response: ApiResponse = await this.provider.request('POST', url + 'guardar_persona.php', {
      persona
    })

    return response;
  }

  async obtenerArbol(): Promise<ApiResponse> {
    const url = this.PROTOCOL + '//' + this.DOMINIO + '/' + this.WSERVICE + '/';

    const response: ApiResponse = await this.provider.request('GET', url + 'obtener_arbol.php')
    //console.log(response);

    return response;
  }

  async obtenerIP(): Promise<string> {
    const url = this.PROTOCOL + '//' + this.DOMINIO + '/' + this.WSERVICE + '/';

    const response: IP = await this.provider.request('GET', url + 'ip_service.php')
    //console.log(response);

    return response.local_ip;
  }

  async actualizarPosicionLogro(logro: LogroDesafio): Promise<ApiResponse> {
    const url = this.PROTOCOL + '//' + this.DOMINIO + '/' + this.WSERVICE + '/';

    const response: ApiResponse = await this.provider.request('POST', url + 'update_posiciones.php', { logros: [logro] })
    console.log(response);

    return response;


    /*     try {
          const response = await this.http.post<ApiResponse>(`${this.baseUrl}/update_posiciones`, {
            logros: [logro]
          }).toPromise();
          return response || { success: false, message: 'No response from server' };
        } catch (error) {
          console.error('Error actualizando posición:', error);
          return { success: false, message: 'Error de conexión' };
        } */
  }

  getImageUrl(imageName: string): string {
    const url = this.PROTOCOL + '//' + this.DOMINIO + '/ws-arbol';

    return `${url}/get_image.php?name=${imageName}`;
  }

}