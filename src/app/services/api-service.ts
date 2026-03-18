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
    return this.http.get<any>(`${this.apiUrl}/livres`, { params: criteres });
  }

  createArticle(article: any): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/articles`, article);
  }

  getAuteurs(): Observable<Auteur[]> {
    return this.http.get<Auteur[]>(`${this.apiUrl}/auteurs`);
  }

  getAuteur(id: number): Observable<Auteur> {
    return this.http.get<Auteur>(`${this.apiUrl}/auteurs/${id}`);
  }

  getAdherents(): Observable<Adherent[] | Adherent> {
    return this.http.get<Adherent[] | Adherent>(`${this.apiUrl}/adherents`);
  }
}
