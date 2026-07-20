import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./register.html",
})
export class RegisterPage {
  private readonly auth = inject(AuthService);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  passwordConfirm = '';
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected async onRegister(): Promise<void> {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim() || !this.password.trim() || !this.passwordConfirm.trim()) {
      this.error.set('Veuillez remplir tous les champs.');
      return;
    }

    if (this.password !== this.passwordConfirm) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const fullName = `${this.firstName.trim()} ${this.lastName.trim()}`;
      await this.auth.signUp(this.email.trim(), this.password, fullName);
    } catch (err) {
      this.error.set(
        err instanceof Error && err.message.toLowerCase().includes('already registered')
          ? 'Un compte existe déjà avec cet email.'
          : 'Impossible de créer le compte. Réessayez.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
