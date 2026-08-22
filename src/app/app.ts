import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TopMenu} from './components/top-menu/top-menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gymcore-web');
}
