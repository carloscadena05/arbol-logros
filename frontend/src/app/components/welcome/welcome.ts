import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [MatDialogModule, RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class Welcome {
  dialog_done() {
    localStorage.setItem('dialog_done', JSON.stringify(true))
  }
}
