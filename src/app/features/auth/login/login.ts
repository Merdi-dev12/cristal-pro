import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./login.html",
})
export class LoginPage {
  private readonly auth = inject(AuthService);

  email = '';
  password = '';
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected async onLogin(): Promise<void> {
    if (!this.email.trim() || !this.password.trim()) {
      this.error.set('Veuillez remplir tous les champs.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.signIn(this.email.trim(), this.password);
    } catch {
      this.error.set('Adresse email ou mot de passe incorrect.');
    } finally {
      this.loading.set(false);
    }
  }
}
