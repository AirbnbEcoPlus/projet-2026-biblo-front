import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { SearchLivre } from './components/search-livre/search-livre';
import { AutheursList } from './components/auteurs-list/auteurs-list';
import { MonCompte } from './components/mon-compte/mon-compte';
import { authGuard } from './guards/auth-guard';
import { LivreList } from './components/livres-list/livres-list';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'livres-list', component: LivreList},
  { path: 'search-livres', component: SearchLivre },
  { path: 'auteurs', component: AutheursList },
  { path: 'mon-compte', component: MonCompte, canActivate: [authGuard] },
  { path: 'login', component: Login },
];
