import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { Categorie } from '../models/categorie';
import { Article } from '../models/article';
import { Livre } from '../models/livre';
import { Auteur } from '../models/auteur';
import { Adherent } from '../models/adherent';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private apiOrigin = this.resolveApiOrigin();

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/categories`);
  }

  getCategorie(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/categories/${id}`);
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/articles`);
  }

  getArticle(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/articles/${id}`);
  }

  getLivres(criteres?: Record<string, string>): Observable<Livre[]> {
    return this.http
      .get<Livre[]>(`${this.apiUrl}/livres`, { params: criteres })
      .pipe(map((livres) => livres.map((livre) => this.normalizeLivre(livre))));
  }

  getLivreById(id: string | number): Observable<Livre> {
    return this.http
      .get<Livre>(`${this.apiUrl}/livres/${id}`)
      .pipe(map((livre) => this.normalizeLivre(livre)));
  }

  createArticle(article: any): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/articles`, article);
  }

  getAuteurs(page: number = 1): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/auteurs?page=${page}`);
  }

  getAuteur(id: number): Observable<Auteur> {
    return this.http.get<Auteur>(`${this.apiUrl}/auteurs/${id}`);
  }

  getAdherents(): Observable<Adherent[] | Adherent> {
    return this.http
      .get<Adherent[] | Adherent>(`${this.apiUrl}/adherents`)
      .pipe(map((payload) => this.normalizeAdherentPayload(payload)));
  }

  createReservation(livreId: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/reservations`, { livre: livreId });
  }

  deleteReservation(reservationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reservations/${reservationId}`);
  }

  updateMyAdherentProfile(payload: { email: string; numTel: string; password?: string }): Observable<Adherent> {
    return this.http
      .patch<Adherent>(`${this.apiUrl}/adherents`, payload)
      .pipe(map((adherent) => this.normalizeAdherent(adherent)));
  }

  private resolveApiOrigin(): string {
    try {
      return new URL(this.apiUrl).origin;
    } catch {
      return '';
    }
  }

  private normalizePhotoUrl(photoUrl?: string | null): string | null | undefined {
    if (!photoUrl) {
      return photoUrl;
    }

    const trimmedUrl = photoUrl.trim();

    if (
      trimmedUrl.startsWith('http://') ||
      trimmedUrl.startsWith('https://') ||
      trimmedUrl.startsWith('data:') ||
      trimmedUrl.startsWith('blob:')
    ) {
      return trimmedUrl;
    }

    if (!this.apiOrigin) {
      return trimmedUrl;
    }

    if (trimmedUrl.startsWith('/')) {
      return `${this.apiOrigin}${trimmedUrl}`;
    }

    return `${this.apiOrigin}/${trimmedUrl}`;
  }

  private normalizeLivre(livre: Livre): Livre {
    return {
      ...livre,
      photoCouverture: this.normalizePhotoUrl(livre.photoCouverture) || null,
    };
  }

  private normalizeAdherent(adherent: Adherent): Adherent {
    return {
      ...adherent,
      emprunts: (adherent.emprunts || []).map((emprunt) => ({
        ...emprunt,
        livre: {
          ...emprunt.livre,
          photoCouverture: this.normalizePhotoUrl(emprunt.livre?.photoCouverture) || null,
        },
      })),
      reservations: (adherent.reservations || []).map((reservation) => ({
        ...reservation,
        livre: {
          ...reservation.livre,
          photoCouverture: this.normalizePhotoUrl(reservation.livre?.photoCouverture) || null,
        },
      })),
    };
  }

  private normalizeAdherentPayload(payload: Adherent[] | Adherent): Adherent[] | Adherent {
    if (Array.isArray(payload)) {
      return payload.map((adherent) => this.normalizeAdherent(adherent));
    }

    return this.normalizeAdherent(payload);
  }
}
