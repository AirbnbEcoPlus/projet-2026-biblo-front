import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { AuthService } from '../../services/auth-service';
import { Adherent } from '../../models/adherent';

@Component({
  selector: 'app-mon-compte',
  imports: [CommonModule, DatePipe],
  templateUrl: './mon-compte.html',
  styleUrl: './mon-compte.css',
})
export class MonCompte {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  adherent = signal<Adherent | null>(null);
  loading = signal(true);
  errorMessage = signal('');

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
}
