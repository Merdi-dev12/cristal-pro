import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./register.html",
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  passwordConfirm = '';
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly info = signal('');

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected async onRegister(): Promise<void> {
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
    this.info.set('');

    try {
      const fullName = `${this.firstName.trim()} ${this.lastName.trim()}`;
      const { needsConfirmation } = await this.auth.signUp(this.email.trim(), this.password, fullName);

      if (needsConfirmation) {
        this.info.set('Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      if (message.includes('already registered')) {
        this.error.set('Un compte existe déjà avec cet email.');
      } else if (message.includes('rate limit')) {
        this.error.set('Trop de tentatives d\'inscription. Réessayez dans quelques minutes.');
      } else {
        this.error.set('Impossible de créer le compte. Réessayez.');
      }
    } finally {
      this.loading.set(false);
    }
    }
  }
}
