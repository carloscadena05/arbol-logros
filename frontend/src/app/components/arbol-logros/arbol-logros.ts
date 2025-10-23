import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
//import * as d3 from 'd3';
import { Api } from '../../services/api';
declare var d3: any;
interface TreeNode {
  name: string;
  type: string;
  description?: string;
  children?: TreeNode[];
}

@Component({
  selector: 'app-arbol-logros',
  templateUrl: './arbol-logros.html',
  styleUrls: ['./arbol-logros.scss']
})
export class ArbolLogros implements OnInit, AfterViewInit {
  private svg: any;
  private g: any;
  private margin = { top: 20, right: 120, bottom: 20, left: 120 };
  private width = 960 - this.margin.left - this.margin.right;
  private height = 600 - this.margin.top - this.margin.bottom;
  private treeLayout: any;
  private root: any;

  datos: any[] = [];

  constructor(private apiService: Api, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    this.inicializarSVG();
  }

  private inicializarSVG(): void {
    const container = d3.select(this.elementRef.nativeElement).select('#tree-container');
    container.selectAll('*').remove();

    this.svg = container
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.g = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.treeLayout = d3.tree().size([this.height, this.width]);
  }

  cargarDatos(): void {
    this.apiService.obtenerArbol().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.datos = response.data;
          this.dibujarArbol();
        }
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.mostrarMensajeError();
      }
    });
  }

  private dibujarArbol(): void {
    if (this.datos.length === 0) {
      this.mostrarMensajeVacio();
      return;
    }

    const treeData = this.prepararDatosParaArbol();
    this.root = d3.hierarchy(treeData);
    this.treeLayout(this.root);

    this.g.selectAll('*').remove();

    // Dibujar enlaces
    const link = this.g.selectAll('.link')
      .data(this.root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x)
      )
      .style('fill', 'none')
      .style('stroke', '#ccc')
      .style('stroke-width', '2px');

    // Dibujar nodos
    const node = this.g.selectAll('.node')
      .data(this.root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    // Agregar círculos a los nodos
    node.append('circle')
      .attr('r', 8)
      .style('fill', (d: any) => this.obtenerColorNodo(d))
      .style('stroke', '#fff')
      .style('stroke-width', '2px')
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        d3.select(this).transition()
          .duration(200)
          .attr('r', 12);
      })
      .on('mouseout', (event: any, d: any) => {
        d3.select(this).transition()
          .duration(200)
          .attr('r', 8);
      });

    // Agregar texto a los nodos
    node.append('text')
      .attr('dy', '.31em')
      .attr('x', (d: any) => d.children ? -12 : 12)
      .style('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif')
      .style('fill', '#333')
      .text((d: any) => {
        const text = d.data.name;
        return text.length > 25 ? text.substring(0, 25) + '...' : text;
      });

    // Tooltips
    node.append('title')
      .text((d: any) => d.data.description || d.data.name);
  }

  private obtenerColorNodo(d: any): string {
    switch (d.data.type) {
      case 'persona':
        return '#4e79a7';
      case 'logro':
        return '#f28e2c';
      default:
        return '#59a14f';
    }
  }

  private prepararDatosParaArbol(): TreeNode {
    if (this.datos.length === 0) {
      return {
        name: 'No hay datos',
        type: 'vacio',
        description: 'No se han registrado personas aún'
      };
    }

    const persona = this.datos[0];
    
    const treeData: TreeNode = {
      name: persona.nombre,
      type: 'persona',
      description: `Persona registrada`,
      children: []
    };

    if (persona.logros && persona.logros.length > 0) {
      treeData.children = persona.logros.map((logro: any) => ({
        name: logro.titulo,
        type: 'logro',
        description: logro.descripcion || 'Sin descripción'
      }));
    }

    return treeData;
  }

  private mostrarMensajeVacio(): void {
    this.g.append('text')
      .attr('x', this.width / 2)
      .attr('y', this.height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', '#666')
      .text('No hay datos para mostrar. Registra una persona y sus logros.');
  }

  private mostrarMensajeError(): void {
    this.g.append('text')
      .attr('x', this.width / 2)
      .attr('y', this.height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', '#dc3545')
      .text('Error al cargar los datos. Verifica la conexión.');
  }
}