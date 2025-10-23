import { Component, OnInit, ElementRef } from '@angular/core';
// import * as d3 from 'd3';

import { Api } from '../../services/api';
declare var d3: any;
@Component({
  selector: 'app-arbol-logros',
  templateUrl: './arbol-logros.html',
  styleUrls: ['./arbol-logros.scss']
})
export class ArbolLogros implements OnInit {
  private svg: any;
  private margin = { top: 20, right: 90, bottom: 30, left: 90 };
  private width = 800 - this.margin.left - this.margin.right;
  private height = 500 - this.margin.top - this.margin.bottom;

  constructor(private apiService: Api, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.apiService.obtenerArbol().subscribe({
      next: (data) => {
        this.crearArbol(data);
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
      }
    });
  }

  private crearArbol(data: any[]): void {
    // Limpiar SVG existente
    d3.select(this.elementRef.nativeElement).select('svg').remove();

    // Crear SVG
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Preparar datos para D3 hierarchy
    const treeData = this.prepararDatosParaArbol(data);
    
    // Crear layout de árbol
    const treeLayout = d3.tree().size([this.height, this.width]);
    const root = d3.hierarchy(treeData);
    treeLayout(root);

    // Dibujar enlaces
    this.svg.selectAll('.link')
      .data(root.links())
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
    const node = this.svg.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    // Agregar círculos a los nodos
    node.append('circle')
      .attr('r', 10)
      .style('fill', (d: any) => d.data.type === 'persona' ? '#69b3a2' : '#ff6b6b')
      .style('stroke', '#fff')
      .style('stroke-width', '2px');

    // Agregar texto a los nodos
    node.append('text')
      .attr('dy', '.31em')
      .attr('x', (d: any) => d.children ? -15 : 15)
      .style('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .text((d: any) => d.data.name)
      .style('font-size', '12px')
      .style('font-family', 'Arial');

    // Tooltips
    node.append('title')
      .text((d: any) => d.data.description || d.data.name);
  }

  private prepararDatosParaArbol(data: any[]): any {
    if (data.length === 0) {
      return { name: 'No hay datos', children: [] };
    }

    // Para este ejemplo, mostramos la primera persona
    const persona = data[0];
    
    const treeData = {
      name: persona.nombre,
      type: 'persona',
      description: `Email: ${persona.email}`,
      children: persona.logros.map((logro: any) => ({
        name: logro.titulo,
        type: 'logro',
        description: `${logro.descripcion}\nCategoría: ${logro.categoria}\nFecha: ${logro.fecha_logro}`
      }))
    };

    return treeData;
  }
}