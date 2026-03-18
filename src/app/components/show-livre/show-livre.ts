import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api-service';
import { Livre } from '../../models/livre';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-show-livre',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './show-livre.html',
  styleUrl: './show-livre.css'
})
export class ShowLivre implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private location = inject(Location);
  authService = inject(AuthService);
  
  livre = signal<Livre | null>(null);
  loading = signal(true);
  reserving = signal(false);
  reservationMessage = signal('');
  reservationError = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.apiService.getLivreById(id).subscribe({
        next: (data) => {
          this.livre.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  back() {
    this.location.back();
  }

  formatAuteurs(auteurs: Livre['auteurs']): string {
    if (!auteurs?.length) {
      return 'Auteur inconnu';
    }

    return auteurs
      .map((auteur) => `${auteur.prenom} ${auteur.nom}`.trim())
      .filter(Boolean)
      .join(', ');
  }

  formatCategories(categories: Livre['categories']): string {
    if (!categories?.length) {
      return 'Aucune catégorie';
    }

    return categories
      .map((categorie) => categorie.nom || categorie.libelle || '')
      .filter(Boolean)
      .join(', ');
  }

  canReserve(livre: Livre): boolean {
    return this.authService.isLoggedIn() && !this.reserving() && !livre.reserve && !livre.emprunte;
  }

  getReservationStateLabel(livre: Livre): string {
    if (livre.emprunte) {
      return 'Indisponible (emprunte)';
    }

    if (livre.reserve) {
      return 'Deja reserve';
    }

    return 'Disponible';
  }

  reserveBook(livre: Livre) {
    if (!this.canReserve(livre)) {
      return;
    }

    this.reserving.set(true);
    this.reservationError.set('');
    this.reservationMessage.set('');

    this.apiService.createReservation(livre.id).subscribe({
      next: () => {
        this.livre.update((current) => current ? { ...current, reserve: true } : current);
        this.reservationMessage.set('Livre reserve avec succes.');
        this.reserving.set(false);
      },
      error: (err) => {
        const backendMessage = err?.error?.error;

        if (err?.status === 409) {
          this.reservationError.set(backendMessage || 'Reservation impossible pour ce livre.');
        } else if (err?.status === 401) {
          this.reservationError.set('Vous devez etre connecte pour reserver.');
        } else {
          this.reservationError.set(backendMessage || 'Impossible de reserver ce livre pour le moment.');
        }

        this.reserving.set(false);
      }
    });
  }
}