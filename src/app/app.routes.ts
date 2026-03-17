import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ArticlesList } from './components/articles-list/articles-list';
import { AddArticle } from './components/add-article/add-article';
import { Login } from './components/login/login';
import { SearchLivre } from './components/search-livre/search-livre';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'articles', component: ArticlesList },
  { path: 'search-livres', component: SearchLivre },
  { path: 'add-article', component: AddArticle, canActivate: [adminGuard] },
  { path: 'login', component: Login },
];
