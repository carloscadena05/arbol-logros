/* import { Component, OnInit, ElementRef, ViewChild, Input, HostListener } from '@angular/core';
import { Api } from '../../services/api';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Logro } from '../logro/logro';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var d3: any;

export interface LogroDesafio {
  titulo: string;
  descripcion: string;
  desafio: string;
  nombre: string;
  x?: number;
  y?: number;
  id?: string;
}

export interface Persona {
  nombre: string;
  logros: LogroDesafio[];
}

@Component({
  selector: 'app-arbol-logros',
  templateUrl: './arbol-logros.html',
  styleUrls: ['./arbol-logros.scss'],
  imports: [MatDialogModule, CommonModule, RouterLink]
})
export class ArbolLogros implements OnInit {
  @ViewChild('container', { static: true }) container!: ElementRef;

  datos: Persona[] = [];
  cargando: boolean = true;
  error: string | null = null;

  private svg: any;
  private width: number = 0;
  private height: number = 0;
  private readonly boxWidth = 180;
  private readonly boxHeight = 40;
  private readonly margin = 25;

  private intervalId: any;

  constructor(private apiService: Api, private dialog: MatDialog) { }

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
    this.initVisualization();
    
    this.intervalId = setInterval(() => this.actualizarDatos(), 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async cargarDatos(): Promise<void> {
    try {
      this.cargando = true;
      this.error = null;
      const response = await this.apiService.obtenerArbol();
      
      if (response.success && response.data) {
        this.datos = response.data;
      } else {
        this.error = response.message || 'Error al cargar los datos';
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.error = 'Error de conexión con el servidor';
    } finally {
      this.cargando = false;
    }
  }

  private async actualizarDatos(): Promise<void> {
    try {
      const response = await this.apiService.obtenerArbol();
      console.log(response);
      
      if (response.success && response.data) {
        // Solo actualizar si hay cambios en los datos (nuevos logros)
        const nuevosDatos = response.data;
        if (this.hayCambios(this.datos, nuevosDatos)) {
          // Mantener las posiciones actuales de los logros existentes
          this.datos = this.fusionarDatosConPosiciones(this.datos, nuevosDatos);
          this.redibujarLogros();
        }
      }
    } catch (error) {
      console.error('Error actualizando datos:', error);
    }
  }

  private fusionarDatosConPosiciones(datosActuales: Persona[], nuevosDatos: Persona[]): Persona[] {
    // Crear mapa de logros existentes con sus posiciones
    const mapaPosiciones = new Map<string, { x: number, y: number }>();
    
    datosActuales.forEach(persona => {
      persona.logros.forEach(logro => {
        const id = this.generarIdLogro(logro);
        if (logro.x !== undefined && logro.y !== undefined) {
          mapaPosiciones.set(id, { x: logro.x, y: logro.y });
        }
      });
    });

    // Aplicar posiciones existentes a los nuevos datos
    const datosFusionados = nuevosDatos.map(persona => ({
      ...persona,
      logros: persona.logros.map(logro => {
        const id = this.generarIdLogro(logro);
        const posicionExistente = mapaPosiciones.get(id);
        
        // Si existe posición guardada, usarla; si no, generar una nueva
        if (posicionExistente) {
          return {
            ...logro,
            x: posicionExistente.x,
            y: posicionExistente.y
          };
        } else {
          // Para logros nuevos, generar posición aleatoria
          const nuevaPosicion = this.generarPosicionAleatoriaValida(
            this.obtenerTodosLogros(datosActuales)
          );
          
          const new_logro = {
            ...logro,
            x: nuevaPosicion?.x || Math.random() * (this.width - this.boxWidth - 100) + 50,
            y: nuevaPosicion?.y || Math.random() * (this.height - this.boxHeight - 100) + 50
          }
          
          this.apiService.actualizarPosicionLogro(new_logro)

          return new_logro;
        }
      })
    }));

    return datosFusionados;
  }

  private hayCambios(datosViejos: Persona[], datosNuevos: Persona[]): boolean {
    const totalViejos = datosViejos.reduce((sum, persona) => sum + persona.logros.length, 0);
    const totalNuevos = datosNuevos.reduce((sum, persona) => sum + persona.logros.length, 0);
    
    if (totalViejos !== totalNuevos) return true;
    
    const idsViejos = new Set(this.obtenerTodosLogros(datosViejos).map(l => this.generarIdLogro(l)));
    const idsNuevos = new Set(this.obtenerTodosLogros(datosNuevos).map(l => this.generarIdLogro(l)));
    
    return !this.sonSetsIguales(idsViejos, idsNuevos);
  }

  private sonSetsIguales(set1: Set<string>, set2: Set<string>): boolean {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  private obtenerTodosLogros(datos: Persona[]): LogroDesafio[] {
    const todosLogros: LogroDesafio[] = [];
    datos.forEach(persona => {
      persona.logros.forEach(logro => {
        todosLogros.push(logro);
      });
    });
    return todosLogros;
  }

  private initVisualization(): void {
    this.width = document.body.offsetWidth || window.innerWidth;
    this.height = document.body.offsetHeight || window.innerHeight;

    d3.select(this.container.nativeElement).selectAll('*').remove();

    this.svg = d3.select(this.container.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background', 'url("http://localhost/ws-arbol/output-onlinepngtools.webp"), #13538a')
      .style('background-size', 'cover')
      .style('background-position', 'center');

    if (this.datos.length > 0) {
      this.dibujarLogros();
    }
  }

  private dibujarLogros(): void {
    const todosLogros = this.obtenerTodosLogros(this.datos);

    if (todosLogros.length === 0) return;

    // Data binding con D3
    const logroBoxes = this.svg.selectAll('.logro-box')
      .data(todosLogros, (d: LogroDesafio) => this.generarIdLogro(d));

    // Entrar (nuevos elementos)
    const logroBoxesEnter = logroBoxes.enter()
      .append('g')
      .attr('class', 'logro-box')
      .attr('transform', (d: LogroDesafio) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')

      .on('click', (event: any, d: LogroDesafio) => {
          this.open_dialog(d);
      });

    // Crear elementos para nuevos logros
    logroBoxesEnter.append('rect')
      .attr('width', this.boxWidth)
      .attr('height', this.boxHeight)
      .attr('rx', 10)
      .attr('ry', 10)
      .style('fill', '#13538a')
      .style('fill-opacity', 0.75)
      .style('stroke', '#f3d527')
      .style('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

    logroBoxesEnter.append('text')
      .attr('x', this.boxWidth / 2)
      .attr('y', this.boxHeight / 2 + 5)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#f3d527')
      .style('pointer-events', 'none')
      .text((d: LogroDesafio) => this.acortarTexto(d.titulo, 25));

    // Animación de entrada
    logroBoxesEnter
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .attr('opacity', 1);

    // Actualizar (elementos existentes)
    logroBoxes
      .transition()
      .duration(500)
      .attr('transform', (d: LogroDesafio) => `translate(${d.x}, ${d.y})`);

    // Salir (elementos removidos)
    logroBoxes.exit()
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .remove();
  }

  private acortarTexto(texto: string, maxLength: number): string {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength - 3) + '...';
  }

  private generarIdLogro(logro: LogroDesafio): string {
    return `${logro.nombre}-${logro.titulo}-${logro.desafio}`.replace(/\s+/g, '-').toLowerCase();
  }

  private generarPosicionAleatoriaValida(logrosExistentes: LogroDesafio[]): { x: number, y: number } | null {
    const maxIntentos = 100;
    const areaSegura = {
      xMin: this.margin + 50,
      xMax: this.width - this.boxWidth - this.margin - 50,
      yMin: this.margin + 50,
      yMax: this.height - this.boxHeight - this.margin - 50
    };

    for (let i = 0; i < maxIntentos; i++) {
      const posicion = {
        x: Math.random() * (areaSegura.xMax - areaSegura.xMin) + areaSegura.xMin,
        y: Math.random() * (areaSegura.yMax - areaSegura.yMin) + areaSegura.yMin
      };

      const posicionValida = !logrosExistentes.some(logro => 
        logro.x !== undefined && 
        logro.y !== undefined &&
        this.calcularDistancia(posicion, { x: logro.x, y: logro.y }) < 100
      );

      if (posicionValida) {
        return posicion;
      }
    }
    
    return null;
  }

  private calcularDistancia(pos1: { x: number, y: number }, pos2: { x: number, y: number }): number {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  private redibujarLogros(): void {
    this.dibujarLogros();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.initVisualization();
  }

  open_dialog(logro: LogroDesafio): void {
    console.log(logro);
    
    this.dialog.open(Logro, {
      width: '500px',
      data: logro
    });
  }

  recargarDatos(): void {
    this.cargarDatos().then(() => {
      this.initVisualization();
    });
  }
} */

import { Component, OnInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Api } from '../../services/api';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Logro } from '../logro/logro';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

declare var d3: any;

export interface LogroDesafio {
  titulo: string;
  descripcion: string;
  desafio: string;
  nombre: string;
  x?: number;
  y?: number;
  id?: string;
}

export interface Persona {
  nombre: string;
  logros: LogroDesafio[];
}

@Component({
  selector: 'app-arbol-logros',
  templateUrl: './arbol-logros.html',
  styleUrls: ['./arbol-logros.scss'],
  imports: [MatDialogModule, CommonModule, RouterLink, QRCodeComponent]
})
export class ArbolLogros implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  datos: Persona[] = [];
  cargando: boolean = true;
  error: string | null = null;

  is_master_pc = JSON.parse(localStorage.getItem('is_master_pc') ?? 'false');
  url: string = '';
  // Viewport fijo
  private readonly fixedHeight = document.body.offsetHeight;
  private readonly fixedWidth = document.body.offsetWidth // this.fixedHeight * (1920/1080);

  // Zoom y pan
  zoom: number = 1;
  private minZoom: number = 0.3;
  private maxZoom: number = 2;
  private translateX: number = 0;
  private translateY: number = 0;
  private isDragging: boolean = false;
  private startX: number = 0;
  private startY: number = 0;

  private svg: any;
  private zoomBehavior: any;
  private mainGroup: any;

  private intervalId: any;
  private isMobile: boolean = false;
  private backgroundImageUrl: string;

  PROTOCOL = typeof window !== 'undefined' ? window.location.protocol : 'http:'; // Asigna un valor por defecto para Node.js
  PORT = typeof window !== 'undefined' ? window.location.port : '4200'; // Asigna un valor por defecto para Node.js
  IP = typeof window !== 'undefined' ? window.location.hostname : 'localhost'; // Asigna un valor por defecto para Node.js
  constructor(
    private apiService: Api,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.checkIfMobile();
    this.backgroundImageUrl = this.getBackgroundImageUrl();

  }



  async ngOnInit(): Promise<void> {
    this.IP = await this.apiService.obtenerIP()
    const _u = this.PROTOCOL + '//' + this.IP + ':' + this.PORT
    this.url = _u + this.router.url

    await this.cargarDatos();
    this.initVisualization();

    this.intervalId = setInterval(() => this.actualizarDatos(), 5000);

  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Controles de zoom públicos
  zoomIn(): void {
    this.zoom = Math.min(this.maxZoom, this.zoom + 0.1);
    this.applyTransform();
  }

  zoomOut(): void {
    this.zoom = Math.max(this.minZoom, this.zoom - 0.1);
    this.applyTransform();
  }

  recenterView(): void {
    this.zoom = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.applyTransform();
  }

  private applyTransform(zoom?: any): void {
   // console.log(zoom, this.zoom);

    if (this.mainGroup) {
      this.mainGroup.attr('transform',
        `translate(${this.translateX},${this.translateY}) scale(${zoom ?? this.zoom})`
      );
    }
    //console.log(zoom, this.zoom);

  }

  private async cargarDatos(): Promise<void> {
    try {
      this.cargando = true;
      this.error = null;
      const response = await this.apiService.obtenerArbol();

      if (response.success && response.data) {
        this.datos = response.data;
      } else {
        this.error = response.message || 'Error al cargar los datos';
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.error = 'Error de conexión con el servidor';
    } finally {
      this.cargando = false;
    }
  }

  private async actualizarDatos(): Promise<void> {
    try {
      const response = await this.apiService.obtenerArbol();

      if (response.success && response.data) {
        const nuevosDatos = response.data;
        if (this.hayCambios(this.datos, nuevosDatos)) {
          this.datos = this.fusionarDatosConPosiciones(this.datos, nuevosDatos);
          this.redibujarLogros();
        }
      }
    } catch (error) {
      console.error('Error actualizando datos:', error);
    }
  }

  private fusionarDatosConPosiciones(datosActuales: Persona[], nuevosDatos: Persona[]): Persona[] {
    const mapaPosiciones = new Map<string, { x: number, y: number }>();

    datosActuales.forEach(persona => {
      persona.logros.forEach(logro => {
        const id = this.generarIdLogro(logro);
        if (logro.x !== undefined && logro.y !== undefined) {
          mapaPosiciones.set(id, { x: logro.x, y: logro.y });
        }
      });
    });

    const datosFusionados = nuevosDatos.map(persona => ({
      ...persona,
      logros: persona.logros.map(logro => {
        const id = this.generarIdLogro(logro);
        const posicionExistente = mapaPosiciones.get(id);

        if (posicionExistente) {
          return {
            ...logro,
            x: posicionExistente.x,
            y: posicionExistente.y
          };
        } else {
          const nuevaPosicion = this.generarPosicionAleatoriaValida(
            this.obtenerTodosLogros(datosActuales)
          );

          const new_logro = {
            ...logro,
            x: nuevaPosicion?.x || Math.random() * (this.fixedWidth - 180 - 100) + 50,
            y: nuevaPosicion?.y || Math.random() * (this.fixedHeight - 40 - 100) + 50
          }

          // Guardar posición en backend
          if(this.is_master_pc)
          this.apiService.actualizarPosicionLogro(new_logro).catch(error => {
            console.error('Error guardando posición:', error);
          });

          return new_logro;
        }
      })
    }));

    return datosFusionados;
  }

  private hayCambios(datosViejos: Persona[], datosNuevos: Persona[]): boolean {
    const totalViejos = datosViejos.reduce((sum, persona) => sum + persona.logros.length, 0);
    const totalNuevos = datosNuevos.reduce((sum, persona) => sum + persona.logros.length, 0);

    if (totalViejos !== totalNuevos) return true;

    const idsViejos = new Set(this.obtenerTodosLogros(datosViejos).map(l => this.generarIdLogro(l)));
    const idsNuevos = new Set(this.obtenerTodosLogros(datosNuevos).map(l => this.generarIdLogro(l)));

    return !this.sonSetsIguales(idsViejos, idsNuevos);
  }

  private sonSetsIguales(set1: Set<string>, set2: Set<string>): boolean {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  private obtenerTodosLogros(datos: Persona[]): LogroDesafio[] {
    const todosLogros: LogroDesafio[] = [];
    datos.forEach(persona => {
      persona.logros.forEach(logro => {
        todosLogros.push(logro);
      });
    });
    return todosLogros;
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768; // Umbral común para móviles
  }

  private getBackgroundImageUrl(): string {
    if (this.isMobile) {
      // Imagen optimizada para móvil
      return 'https://i.ibb.co/HfnqgLF8/arbol-final-sm-crop.webp';
    } else {
      // Imagen para desktop
      return 'https://i.ibb.co/6Rw8pHk3/arbol-final.webp';
    }
  }

  private initVisualization(): void {
    const containerElement = this.container.nativeElement;

    // Limpiar contenedor
    d3.select(containerElement).selectAll('*').remove();

    // Crear SVG con dimensiones fijas
    this.svg = d3.select(containerElement)
      .append('svg')
      .attr('width', this.fixedWidth)
      .attr('height', this.fixedHeight)
      .style('background', `url("${this.backgroundImageUrl}"), #0d385e`)
      .style('background-size', 'cover')
      .style('background-position', 'center')
      .style('background-repeat', 'no-repeat')
      .style('display', 'block');

    // Agregar definiciones de filtro
    const defs = this.svg.append('defs');

    // Filtro de shadow normal
    const shadowFilter = defs.append('filter')
      .attr('id', 'shadowFilter')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    shadowFilter.append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 4)
      .attr('flood-color', 'rgba(0, 0, 0, 0.3)');

    // Filtro de shadow dorado para animación
    const goldShadowFilter = defs.append('filter')
      .attr('id', 'goldShadowFilter')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    goldShadowFilter.append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 4)
      .attr('stdDeviation', 8)
      .attr('flood-color', 'rgba(243, 211, 39, 0.5)');

    // Grupo principal para zoom/pan
    this.mainGroup = this.svg.append('g')
      .attr('class', 'main-group');

    // Configurar zoom behavior
    this.setupZoom();

    if (this.datos.length > 0) {
      this.dibujarLogros();
    }

    // Aplicar transformación inicial
    this.applyTransform();
  }

  private setupZoom(): void {
    this.zoomBehavior = d3.zoom()
      .scaleExtent([this.minZoom, this.maxZoom])
      .on('zoom', (event: any) => {
        this.zoom = event.transform.k;
        this.translateX = event.transform.x;
        this.translateY = event.transform.y;
        this.mainGroup.attr('transform', event.transform);
      });

    this.svg.call(this.zoomBehavior);

    // También manejar pan con drag para móvil
    this.svg.on('touchstart', (event: any) => {
      if (event.touches.length === 1) {
        this.isDragging = true;
        this.startX = event.touches[0].clientX - this.translateX;
        this.startY = event.touches[0].clientY - this.translateY;
        event.preventDefault();
      }
    });

    this.svg.on('touchmove', (event: any) => {
      if (this.isDragging && event.touches.length === 1) {
        this.translateX = event.touches[0].clientX - this.startX;
        this.translateY = event.touches[0].clientY - this.startY;
        console.log(this.zoom);

        this.applyTransform();
        console.log(this.zoom);
        event.preventDefault();
      }
    });

    this.svg.on('touchend', () => {
      this.isDragging = false;
    });
  }

  private dibujarLogros(): void {
    const todosLogros = this.obtenerTodosLogros(this.datos);

    if (todosLogros.length === 0) return;

    // Data binding con D3 - dibujar en el mainGroup
    const logroBoxes = this.mainGroup.selectAll('.logro-box')
      .data(todosLogros, (d: LogroDesafio) => this.generarIdLogro(d));

    // Entrar (nuevos elementos)
    const logroBoxesEnter = logroBoxes.enter()
      .append('g')
      .attr('class', 'logro-box')
      .attr('transform', (d: LogroDesafio) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event: any, d: LogroDesafio) => {
        event.stopPropagation(); // Prevenir zoom al hacer click
        this.open_dialog(d);
      })
      .on('mouseover', () => {
      d3.select(this).select('rect')
        .style('fill-opacity', 1)
        .style('stroke', '#f3d527')
        .style('stroke-width', '2px');
    })
    .on('mouseout', () => {
      d3.select(this).select('rect')
        .style('fill-opacity', 0.75)
        .style('stroke', 'none');
    });



    // Crear elementos para nuevos logros
    const rects = logroBoxesEnter.append('rect')
      .attr('width', 180)
      .attr('height', 40)
      .attr('rx', 10)
      .attr('ry', 10)
      .style('fill', '#13538a')
      .style('fill-opacity', 0.75)
      .style('stroke', '#f3d527')
      .style('stroke-width', 2)
      .style('filter', 'url(#shadowFilter)'); // Usar filtro SVG personalizado

    logroBoxesEnter.append('text')
      .attr('x', 90)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#f3d527')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text((d: LogroDesafio) => this.acortarTexto(d.titulo, 25));

    // Animación de entrada
    logroBoxesEnter
      .attr('opacity', 0)
      .transition()
      .duration(300)
      .attr('opacity', 1)

    rects
      .transition()
      .delay(300)
      .duration(150)
      .style('filter', 'url(#goldShadowFilter)')
      .transition()
      .duration(150)
      .style('filter', 'url(#shadowFilter)');
    // Actualizar elementos existentes
    logroBoxes
      .transition()
      .duration(400)
      .attr('transform', (d: LogroDesafio) => `translate(${d.x}, ${d.y})`);

    // Salir elementos removidos
    logroBoxes.exit()
      .transition()
      .duration(400)
      .attr('opacity', 0)
      .remove();
  }

  private acortarTexto(texto: string, maxLength: number): string {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength - 3) + '...';
  }

  private generarIdLogro(logro: LogroDesafio): string {
    return `${logro.nombre}-${logro.titulo}-${logro.desafio}`.replace(/\s+/g, '-').toLowerCase();
  }

  private generarPosicionAleatoriaValida(logrosExistentes: LogroDesafio[]): { x: number, y: number } | null {
    const maxIntentos = 150;
    const margin = 50;

    for (let i = 0; i < maxIntentos; i++) {
      const posicion = {
        x: Math.random() * (this.fixedWidth - 180 - margin * 2) + margin,
        y: Math.random() * (this.fixedHeight - 40 - margin * 2) + margin
      };

      const posicionValida = !logrosExistentes.some(logro =>
        logro.x !== undefined &&
        logro.y !== undefined &&
        this.calcularDistancia(posicion, { x: logro.x, y: logro.y }) < 100
      );

      if (posicionValida) {
        return posicion;
      }
    }

    return null;
  }

  private calcularDistancia(pos1: { x: number, y: number }, pos2: { x: number, y: number }): number {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  private redibujarLogros(): void {
    this.dibujarLogros();
  }

  @HostListener('window:resize')
  onResize(): void {
    // No necesitamos redimensionar porque el viewport es fijo
  }

  open_dialog(logro: LogroDesafio): void {
    this.dialog.open(Logro, {
      width: '500px',
      maxWidth: '90vw',
      data: logro
    });
  }

  recargarDatos(): void {
    this.cargarDatos().then(() => {
      this.initVisualization();
    });
  }
}