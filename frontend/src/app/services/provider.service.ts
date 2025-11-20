import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, delay, mergeMap, retryWhen } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

export declare type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  excep: any = {
    "001": "Método de petición incorrecto",
    "002": "Clase incorrecta",
    "003": "Método inexistente",
    "006": "Token no enviado",
    "007": "Parámetros vacíos",
    // Login
    "004": "El usuario no existe",
    "005": "Credenciales inválidas",
  }

  constructor(private http: HttpClient) { }

  /* 
    async production<T>(method: Method, url: string, options?: {
      body?: any,
      params?: any,
      headers?: any
    }): Promise<T> {
      if (url.includes('/neon/')) {
        options = options || {};
  
        options!.headers = {
          ...options!.headers,
          Authorization: "Basic am92ZW5lc2FkZWxhbnRlOjk5MDVlZGMyYTlhZTJlMGQ3MmRjYjU0NmQ1NTg0YWVi"
        }
      }
      const _options: any = {
        body: options?.body,
        params: options?.params,
        headers: new HttpHeaders(options?.headers || {}),
      };
      // console.log(url,options);
      
  
      return new Promise<T>((resolve) =>
        this.http
          .request<any>(method, url, _options)
          .subscribe((response: any) => {
            // console.log(response);
            
            resolve(response);
          })
      );
    } */

  async production<T>(method: Method, url: string, options?: {
    body?: any,
    params?: any,
    headers?: any
  }): Promise<T> {
    options = options || {};
    const hostName = window.location.hostname.toLocaleLowerCase();

    if (hostName === 'privada.jovenesadelante.org' || hostName === 'privada-dev.jovenesadelante.org') {

      if (url.includes('/arbolapi/')) {
        url.replace("/arbolapi/", "https://ja-grad-logros.gt.tc/api/");
      }
    }
    options.headers = {
      ...(options.headers || {}),
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    };

    const _options: any = {
      body: options.body,
      params: options.params,
      headers: new HttpHeaders(options.headers || {})
    };

    return new Promise<T>((resolve, reject) => {
      this.http.request<T>(method, url, _options).pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, i) => {
              const maxRetries = 3;
              const delayMs = 1000;
              if (i < maxRetries) {
                console.warn(`Reintentando (${i + 1}/${maxRetries}) para: ${url}`);
                return of(error).pipe(delay(delayMs));
              }
              console.error(`Fallo definitivo para: ${url}`, error);
              return throwError(() => error);
            })
          )
        ),
        catchError(error => {
          console.error('Error capturado en catchError:', error);
          reject(error);
          return of(null);
        })
      ).subscribe((response: any) => {
        resolve(response);
      });
    });
  }


  async request<T>(method: Method, route: string, params?: any): Promise<T> {
    // Construye la URL completa utilizando la URL base y la ruta proporcionadas
    // let url = utils.URL + route;

    // Ejemplo de URL: http://localhost/ws-template/public/get_users
    return new Promise<T>((resolve, reject) =>
      this.http
        .request<Response>(method, route, {
          body: method != 'GET' ? params : undefined,
          headers: this.headers(),
          params: method !== 'POST' ? this.params({
            ...params,
            usuarios_id: this.get_user()?.usuarios_id
          }) : {},
        })
        .subscribe((response: any) => {
          // console.log(response);

          // Resuelve la promesa con los datos de la respuesta si no hay errores
          if (!response.error) resolve(response);
          // Rechaza la promesa con el error si se encuentra un error en la respuesta
          else {
            reject(`${route}: ${this.excep[response.error_code] ?? response.error_code} ${response.msg}`)
          }
        })
    );
  }
  /**
     * Obtiene las cabeceras para las solicitudes HTTP, incluyendo la autorización y otras cabeceras personalizadas.
     *
     * @remarks
     * Este método forma parte de la plantilla realizada con Angular 17.
     *
     * @returns Las cabeceras HTTP configuradas con la autorización y otras cabeceras necesarias.
     */
  headers(): HttpHeaders {
    return new HttpHeaders()
      .set('Authorization', this.get_token() || '')
      .set('Simple', 'bb1557a2774351913c8557251ec2cbb4');
  }

  /**
  * Convierte los parámetros en una instancia de HttpParams, listos para ser incluidos en una solicitud HTTP.
  *
  * @remarks
  * Este método forma parte de la plantilla realizada con Angular 17.
  *
  * @param params - Los parámetros que se convertirán en una cadena codificada para su inclusión en la solicitud.
  * @returns Una instancia de HttpParams configurada con los parámetros proporcionados.
  */
  params(params: any): HttpParams {
    return new HttpParams().set(
      'params',
      JSON.stringify(params)
    );
  }

  /**
   * Obtiene el token de autenticación almacenado en el sistema.
   *
   * @remarks
   * Este método forma parte de la plantilla realizada con Angular 17.
   *
   * @returns El token de autenticación almacenado en el sistema o una cadena vacía si no está disponible.
   */
  get_token(): string {
    return this.get_user()?.token ?? '';
  }

  /**
   * Obtiene los datos del usuario almacenados en el token de autenticación.
   *
   * @returns Los datos del usuario almacenados en el token decodificado o `null` si el token no está disponible.
   */
  get_user(): any {
    return {};
  }

}
