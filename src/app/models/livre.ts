import { Categorie } from './categorie';

export interface Livre {
  id: number;
  titre: string;
  dateSortie: string;
  langue?: string | null;
  photoCouverture?: string | null;
  emprunts?: unknown[];
  auteurs?: unknown[];
  categories?: Categorie[];
}