import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({ selector: 'app-quote', standalone: true, imports: [FormsModule], templateUrl: './quote.html' })
export class Quote {
  protected readonly sent = signal(false);
  protected submit(): void { this.sent.set(true); }
}
