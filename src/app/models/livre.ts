import { Categorie } from './categorie';
import { Auteur } from './auteur';

export interface Livre {
  id: number;
  titre: string;
  description?: string | null;
  dateSortie: string;
  langue?: string | null;
  photoCouverture?: string | null;
  emprunts?: unknown[];
  reserve?: boolean;
  emprunte?: boolean;
  dateRetourPrevueEmprunt?: string | null;
  auteurs?: Auteur[];
  categories?: Categorie[];
}