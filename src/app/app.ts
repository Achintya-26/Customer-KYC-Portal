import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './components/shared/topbar/topbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Frontend';
}
