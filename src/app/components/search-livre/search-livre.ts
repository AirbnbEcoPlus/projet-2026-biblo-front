import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api-service';
import { Livre } from '../../models/livre';

type SearchType = 'titre' | 'dateDebut' | 'dateFin' | 'langue' | 'categorie' | 'auteur';

interface ActiveCriterion {
  type: SearchType;
  value: string;
}

interface CriterionOption {
  type: SearchType;
  label: string;
  placeholder: string;
  inputType: 'text' | 'date';
}

@Component({
  selector: 'app-search-livre',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './search-livre.html',
  styleUrl: './search-livre.css',
})
export class SearchLivre {
  private apiService = inject(ApiService);
  private readonly itemsPerPage = 10;

  criterionOptions: CriterionOption[] = [
    { type: 'titre', label: 'Titre', placeholder: 'Ex: The book of mormon', inputType: 'text' },
    { type: 'dateDebut', label: 'Date debut', placeholder: '', inputType: 'date' },
    { type: 'dateFin', label: 'Date fin', placeholder: '', inputType: 'date' },
    { type: 'langue', label: 'Langue', placeholder: 'Ex: FR', inputType: 'text' },
    { type: 'categorie', label: 'Categorie', placeholder: 'Ex: Roman', inputType: 'text' },
    { type: 'auteur', label: 'Auteur', placeholder: 'Ex: FAURE', inputType: 'text' },
  ];

  selectedType: SearchType = 'titre';
  criterionValue = '';

  criteres = signal<ActiveCriterion[]>([]);
  allLivres = signal<Livre[]>([]);
  livres = signal<Livre[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  currentPage = signal(1);
  totalItems = signal(0);
  serverPaginated = signal(false);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)));
  hasPreviousPage = computed(() => this.currentPage() > 1);
  hasNextPage = computed(() => this.currentPage() < this.totalPages());

  get selectedOption(): CriterionOption {
    return this.criterionOptions.find(option => option.type === this.selectedType) ?? this.criterionOptions[0];
  }

  getLabelForType(type: SearchType): string {
    return this.criterionOptions.find((option) => option.type === type)?.label ?? type;
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
    this.search(1);
  }

  search(page: number = 1) {
    if (page < 1) {
      return;
    }

    if (this.serverPaginated()) {
      this.fetchPageFromApi(page);
      return;
    }

    if (this.allLivres().length === 0 || page === 1) {
      this.fetchPageFromApi(1);
      return;
    }

    if (page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.updateLocalPage();
  }

  private fetchPageFromApi(page: number) {
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
        case 'auteur':
          params['auteur'] = critere.value;
          break;
        case 'dateDebut':
          params['debut'] = critere.value;
          break;
        case 'dateFin':
          params['fin'] = critere.value;
          break;
      }
    }

    params['page'] = page.toString();

    this.loading.set(true);
    this.errorMessage.set('');

    this.apiService.getLivres(params).subscribe({
      next: (data: any) => {
        const parsed = this.parseLivresResponse(data);

        this.serverPaginated.set(parsed.serverPaginated);
        this.totalItems.set(parsed.totalItems);

        if (parsed.serverPaginated) {
          this.currentPage.set(page);
          this.livres.set(parsed.items);
        } else {
          this.allLivres.set(parsed.items);
          this.currentPage.set(Math.min(page, this.totalPages()));
          this.updateLocalPage();
        }

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement des livres.');
        this.loading.set(false);
      }
    });
  }

  private updateLocalPage() {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.livres.set(this.allLivres().slice(start, end));
  }

  private parseLivresResponse(data: any): { items: Livre[]; totalItems: number; serverPaginated: boolean } {
    if (Array.isArray(data)) {
      return {
        items: data,
        totalItems: data.length,
        serverPaginated: false
      };
    }

    const hydraItems = data?.['hydra:member'];
    const totalItems = data?.['hydra:totalItems'];
    const hasHydraView = Boolean(data?.['hydra:view']);

    if (Array.isArray(hydraItems)) {
      const total = typeof totalItems === 'number' ? totalItems : hydraItems.length;

      return {
        items: hydraItems,
        totalItems: total,
        serverPaginated: hasHydraView || total > hydraItems.length
      };
    }

    return {
      items: [],
      totalItems: 0,
      serverPaginated: false
    };
  }
}
