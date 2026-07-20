import { Component, output } from '@angular/core';

@Component({
  selector: 'app-subscriber-modal',
  imports: [],
  templateUrl: './subscriber-modal.html',
})
export class SubscriberModal {
  readonly close = output<void>();
  readonly login = output<void>();

  protected onClose(): void {
    this.close.emit();
  }

  protected onLogin(): void {
    this.login.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
