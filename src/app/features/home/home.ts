import { Component } from '@angular/core';
import { Hero } from './components/hero/hero'; // Ajuste le chemin relatif vers ton HeroComponent

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero], 
  templateUrl: './home.html'
})
export class Home {
  
}