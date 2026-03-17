import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api-service';
import { Livre } from '../../models/livre';

type SearchType = 'titre' | 'dateDebut' | 'dateFin' | 'langue' | 'categorie';

interface ActiveCriterion {
  type: SearchType;
  value: string;
}

interface CriterionOption {
  type: SearchType;
  label: string;
  placeholder: string;
  inputType: 'text' | 'date' | 'number';
}

@Component({
  selector: 'app-search-livre',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './search-livre.html',
  styleUrl: './search-livre.css',
})
export class SearchLivre {
  private apiService = inject(ApiService);

  criterionOptions: CriterionOption[] = [
    { type: 'titre', label: 'Titre', placeholder: 'Ex: The book of mormon', inputType: 'text' },
    { type: 'dateDebut', label: 'Date debut', placeholder: '', inputType: 'date' },
    { type: 'dateFin', label: 'Date fin', placeholder: '', inputType: 'date' },
    { type: 'langue', label: 'Langue', placeholder: 'Ex: FR', inputType: 'text' },
    { type: 'categorie', label: 'Categorie (ID)', placeholder: 'Ex: 1', inputType: 'number' }
  ];

  selectedType: SearchType = 'titre';
  criterionValue = '';

  criteres = signal<ActiveCriterion[]>([]);
  livres = signal<Livre[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  get selectedOption(): CriterionOption {
    return this.criterionOptions.find(option => option.type === this.selectedType) ?? this.criterionOptions[0];
  }

  addCritere() {
    const value = this.criterionValue.trim();
    if (!value) {
      return;
    }

    const next = [...this.criteres().filter(c => c.type !== this.selectedType), { type: this.selectedType, value }];
    this.criteres.set(next);
    this.criterionValue = '';
  }

  removeCritere(type: SearchType) {
    this.criteres.set(this.criteres().filter(c => c.type !== type));
  }

  clearAll() {
    this.criteres.set([]);
    this.criterionValue = '';
    this.errorMessage.set('');
    this.search();
  }

  search() {
    const params: Record<string, string> = {};

    for (const critere of this.criteres()) {
      switch (critere.type) {
        case 'titre':
          params['titre'] = critere.value;
          break;
        case 'langue':
          params['langue'] = critere.value;
          break;
        case 'categorie':
          params['categorie'] = critere.value;
          break;
        case 'dateDebut':
          params['dateDebut'] = critere.value;
          break;
        case 'dateFin':
          params['dateFin'] = critere.value;
          break;
      }
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.apiService.getLivres(params).subscribe({
      next: livres => {
        this.livres.set(livres);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement des livres.');
        this.loading.set(false);
      }
    });
  }
}
