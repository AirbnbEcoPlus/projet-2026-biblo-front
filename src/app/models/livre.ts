import { Categorie } from './categorie';
import { Auteur } from './auteur';

export interface Livre {
  id: number;
  titre: string;
  dateSortie: string;
  langue?: string | null;
  photoCouverture?: string | null;
  emprunts?: unknown[];
  auteurs?: Auteur[];
  categories?: Categorie[];
}