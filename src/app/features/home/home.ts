import { Component } from '@angular/core';
import { Benefits } from './components/benefits/benefits';
import { ClientSatisfaction } from './components/client-satisfaction/client-satisfaction';
import { Faq } from './components/faq/faq';
import { Hero } from './components/hero/hero';
import { Services } from './components/services/services';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, Benefits, ClientSatisfaction, Services, Faq],
  templateUrl: './home.html',
})
export class Home {
}
