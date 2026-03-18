import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api-service';
import { Livre } from '../../models/livre';
import { CommonModule, DatePipe, Location } from '@angular/common';

@Component({
  selector: 'app-show-livre',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './show-livre.html'
})
export class ShowLivre implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private location = inject(Location);
  
  livre = signal<Livre | null>(null);
  loading = signal(true);

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
}