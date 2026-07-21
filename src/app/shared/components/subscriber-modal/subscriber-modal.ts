import { Component, output } from '@angular/core';

@Component({
  selector: 'app-subscriber-modal',
  imports: [],
  templateUrl: './subscriber-modal.html',
})
export class SubscriberModal {
  readonly close = output<void>();
  readonly subscribe = output<void>();

  protected onClose(): void {
    this.close.emit();
  }

  protected onSubscribe(): void {
    this.subscribe.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
