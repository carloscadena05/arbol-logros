import { Routes } from '@angular/router';
import { FormularioPersona } from './components/formulario-persona/formulario-persona';
import { ArbolLogros } from './components/arbol-logros/arbol-logros';

export const routes: Routes = [
/*     {
        path: '',
        component: ArbolLogros
    }, */
    {
        path: 'form',
        component: FormularioPersona
    },
    {
        path: 'tree',
        component: ArbolLogros
    },
    { 
        path: '**', 
        redirectTo: '/tree' }

];
