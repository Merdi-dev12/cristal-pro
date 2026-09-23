import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({ selector: 'app-contact', standalone: true, imports: [FormsModule], templateUrl: './contact.html' })
export class Contact {
  protected readonly sent = signal(false);
  protected submit(): void { this.sent.set(true); }
}
