import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { Livre } from '../../models/livre';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-livres-list',
  imports: [DatePipe],
  templateUrl: './livres-list.html',
  styleUrl: './livres-list.css',
})
export class LivreList implements OnInit {
  private apiService = inject(ApiService);

  livres = signal<Livre[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  currentPage = signal(1);
  totalItems = signal(0);

  ngOnInit() {
    this.changePage();
  }

  changePage(page : number = 1) {
    const params: Record<string, string> = {
      page : page.toString()
    };
    this.currentPage.set(page);
    this.apiService.getLivres(params).subscribe({
      next: (data: any) => {
        this.livres.set(data);
        this.totalItems.set(data.length);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement des livres.');
        this.loading.set(false);
      }
    });
  }
}
