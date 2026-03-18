export interface LivreEmprunte {
  id: number;
  titre: string;
  photoCouverture?: string | null;
}

export interface Emprunt {
  id: number;
  dateEmprunt: string;
  dateRetour: string;
  livre: LivreEmprunte;
}

export interface Reservation {
  id: number;
  dateResa: string;
  livre: LivreEmprunte;
}

export interface Adherent {
  id: number;
  dateAdhesion: string;
  nom: string;
  prenom: string;
  dateNaiss: string;
  email: string;
  adressePostale: string | null;
  numTel: string | null;
  photo: string | null;
  emprunts: Emprunt[];
  reservations: Reservation[];
}
