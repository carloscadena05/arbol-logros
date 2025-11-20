import { Component, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { Welcome } from './components/welcome/welcome';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Logros JA');

  constructor(private dialog: MatDialog) { }
  ngOnInit() {
    // Si no existe, devuelve 'false' (como string) y luego lo parseamos
    const dialogDone = JSON.parse(localStorage.getItem('dialog_done') ?? 'false');

    if (dialogDone === false) {
      this.dialog.open(Welcome);
    }
  }
}
