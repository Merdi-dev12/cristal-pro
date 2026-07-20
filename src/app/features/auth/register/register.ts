import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
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

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected async onRegister(): Promise<void> {
    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.password.trim() ||
      !this.passwordConfirm.trim()
    ) {
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
      await this.auth.signUp(this.email, this.password, this.firstName, this.lastName);
      await this.router.navigateByUrl('/demenagement');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Inscription impossible.');
    } finally {
      this.loading.set(false);
    }
  }
}
