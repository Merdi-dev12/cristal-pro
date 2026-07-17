import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, Footer],
  templateUrl: './app.html',
})
export class App {
  showChrome = true;


  constructor(private readonly router: Router) {
    this.showChrome = !this.isAuthRoute(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showChrome = !this.isAuthRoute(event.urlAfterRedirects);
      });
  }

  private isAuthRoute(url: string) {
    const path = url.split('?')[0];
    return path === '/connexion' || path === '/inscription';
  }
}

