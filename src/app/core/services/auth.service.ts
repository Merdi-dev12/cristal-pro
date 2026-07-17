import { Service, signal } from '@angular/core';

@Service()
export class AuthService {
  private readonly KEY = 'rheodyce:isSubscriber';

  readonly isSubscriber = signal<boolean>(this.read());

  constructor() {
    // no-op
  }

  setSubscriber(value: boolean): void {
    localStorage.setItem(this.KEY, value ? '1' : '0');
    this.isSubscriber.set(value);
  }

  private read(): boolean {
    try {
      return localStorage.getItem(this.KEY) === '1';
    } catch {
      return false;
    }
  }
}

