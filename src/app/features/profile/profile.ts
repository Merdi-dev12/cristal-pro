import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
})
export class ProfilePage implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly loading = signal(false);
  protected readonly saved = signal(false);
  protected readonly error = signal('');
  protected readonly profileImageUrl = computed(() => {
    const metadata = this.auth.session()?.user.user_metadata;
    const avatarUrl = metadata?.['avatar_url'] ?? metadata?.['picture'];
    return typeof avatarUrl === 'string' ? avatarUrl : '';
  });

  protected fullName = '';
  protected phone = '';

  ngOnInit(): void {
    const profile = this.auth.profile();
    const metadata = this.auth.session()?.user.user_metadata;
    const metadataName = metadata?.['full_name'];

    this.fullName = profile?.full_name || (typeof metadataName === 'string' ? metadataName : '');
    this.phone = profile?.phone ?? '';
  }

  protected async saveProfile(): Promise<void> {
    if (!this.fullName.trim()) {
      this.error.set('Veuillez renseigner votre nom complet.');
      return;
    }

    this.loading.set(true);
    this.saved.set(false);
    this.error.set('');

    try {
      await this.auth.updateProfile(this.fullName, this.phone);
      this.saved.set(true);
    } catch {
      this.error.set('Impossible d’enregistrer vos informations. Réessayez.');
    } finally {
      this.loading.set(false);
    }
  }
}
