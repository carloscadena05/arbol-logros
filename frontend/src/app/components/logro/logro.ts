import { Component, Inject, Signal, signal, WritableSignal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { LogroDesafio } from '../arbol-logros/arbol-logros';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-logro',
  imports: [MatDialogModule, RouterLink],
  templateUrl: './logro.html',
  styleUrl: './logro.scss'
})
export class Logro {
  //protected _logro: any;
  constructor(@Inject(MAT_DIALOG_DATA) public logro: LogroDesafio) {
    //this._logro = signal(logro);
    console.log(logro);
    
  }

}
