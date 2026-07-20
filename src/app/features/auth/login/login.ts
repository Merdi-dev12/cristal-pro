import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./login.html",
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
      await this.auth.signIn(this.email, this.password);
      const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
      await this.router.navigateByUrl(redirect.startsWith('/') ? redirect : '/');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Connexion impossible.');
    } finally {
      this.loading.set(false);
    }
  }
}
