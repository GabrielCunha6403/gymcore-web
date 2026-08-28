import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TopMenu} from './components/top-menu/top-menu';
import { Toast } from './components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenu, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gymcore-web');
}
