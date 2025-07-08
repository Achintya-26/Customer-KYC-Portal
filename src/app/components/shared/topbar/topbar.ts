import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [MatIconModule, RouterModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar {

}
