import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api-service';
import { AuthService } from '../../services/auth-service';
import { Adherent, Reservation } from '../../models/adherent';

@Component({
  selector: 'app-mon-compte',
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './mon-compte.html',
  styleUrl: './mon-compte.css',
})
export class MonCompte {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  adherent = signal<Adherent | null>(null);
  loading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  deletingReservationId = signal<number | null>(null);
  editModalOpen = signal(false);
  savingProfile = signal(false);
  formError = signal('');
  formEmail = '';
  formNumTel = '';
  formPassword = '';
  formPasswordConfirm = '';

  constructor() {
    effect(() => {
      const email = this.authService.userEmail();
      if (email) {
        this.loadMonCompte(email);
      }
    });
  }

  private loadMonCompte(email: string) {
    this.loading.set(true);
    this.errorMessage.set('');

    this.apiService.getAdherents().subscribe({
      next: (payload) => {
        const adherent = this.resolveAdherent(payload, email);
        this.adherent.set(adherent);

        if (!adherent) {
          this.errorMessage.set('Aucun profil adherent trouve pour cet utilisateur.');
        }

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement de votre compte.');
        this.loading.set(false);
      },
    });
  }

  private resolveAdherent(payload: Adherent[] | Adherent, email: string): Adherent | null {
    if (Array.isArray(payload)) {
      return payload.find((item) => item.email === email) ?? null;
    }

    if (payload && payload.email === email) {
      return payload;
    }

    return null;
  }

  deleteReservation(reservation: Reservation) {
    if (this.deletingReservationId() !== null) {
      return;
    }

    const confirmed = window.confirm('Supprimer cette reservation ?');
    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.deletingReservationId.set(reservation.id);

    this.apiService.deleteReservation(reservation.id).subscribe({
      next: () => {
        this.adherent.update((profile) => {
          if (!profile) {
            return profile;
          }

          return {
            ...profile,
            reservations: profile.reservations.filter((item) => item.id !== reservation.id),
          };
        });

        this.deletingReservationId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error || 'Erreur lors de la suppression de la reservation.');
        this.deletingReservationId.set(null);
      },
    });
  }

  openEditModal(profile: Adherent) {
    this.formEmail = profile.email || '';
    this.formNumTel = profile.numTel || '';
    this.formPassword = '';
    this.formPasswordConfirm = '';
    this.formError.set('');
    this.editModalOpen.set(true);
  }

  closeEditModal() {
    if (this.savingProfile()) {
      return;
    }

    this.editModalOpen.set(false);
    this.formError.set('');
  }

  saveProfileUpdates() {
    const profile = this.adherent();
    if (!profile || this.savingProfile()) {
      return;
    }

    const email = this.formEmail.trim();
    const numTel = this.formNumTel.trim();
    const password = this.formPassword;
    const passwordConfirm = this.formPasswordConfirm;

    this.formError.set('');
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!email) {
      this.formError.set('Email obligatoire.');
      return;
    }

    if (password || passwordConfirm) {
      if (password.length < 4) {
        this.formError.set('Le mot de passe doit contenir au moins 4 caracteres.');
        return;
      }

      if (password !== passwordConfirm) {
        this.formError.set('La confirmation du mot de passe ne correspond pas.');
        return;
      }
    }

    const payload: { email: string; numTel: string; password?: string } = {
      email,
      numTel,
    };

    if (password) {
      payload.password = password;
    }

    this.savingProfile.set(true);

    this.apiService.updateMyAdherentProfile(payload).subscribe({
      next: (updated) => {
        const updatedProfile = {
          ...profile,
          ...updated,
          email: updated.email || email,
          numTel: updated.numTel ?? numTel,
        };

        this.adherent.set(updatedProfile);
        this.authService.userEmail.set(updatedProfile.email);
        this.successMessage.set('Informations mises a jour avec succes.');
        this.savingProfile.set(false);
        this.editModalOpen.set(false);
      },
      error: (err) => {
        this.formError.set(err?.error?.message || err?.error?.error || 'Impossible de mettre a jour vos informations.');
        this.savingProfile.set(false);
      },
    });
  }
}
