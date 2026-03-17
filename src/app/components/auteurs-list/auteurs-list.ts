import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { Auteur } from '../../models/auteur';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-auteurs-list',
  imports: [CommonModule],
  templateUrl: './auteurs-list.html',
  styleUrl: './auteurs-list.css',
})
export class AutheursList implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();

  auteurs = signal<Auteur[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  expandedAuteurId = signal<number | null>(null);

  ngOnInit() {
    console.log('AutheursList component initialized');
    this.loadAuteurs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAuteurs() {
    console.log('Loading auteurs...');
    this.loading.set(true);
    this.errorMessage.set('');
    this.apiService.getAuteurs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Auteurs reçus:', data);
          this.auteurs.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des auteurs:', err);
          this.errorMessage.set('Erreur lors du chargement des auteurs: ' + err.message);
          this.loading.set(false);
        },
        complete: () => {
          console.log('Requête auteurs complétée');
        }
      });
  }

  toggleAuteur(auteurId: number) {
    if (this.expandedAuteurId() === auteurId) {
      this.expandedAuteurId.set(null);
    } else {
      this.expandedAuteurId.set(auteurId);
    }
  }
}

