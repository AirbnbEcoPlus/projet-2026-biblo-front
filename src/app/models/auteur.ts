export interface LivreAuteur {
  id: number;
  titre: string;
  dateSortie: string;
  langue: string | null;
  photoCouverture: string | null;
}

export interface Auteur {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  livres: LivreAuteur[];
}
