export interface Mission {
  id: number;
  titre: string;
  detail: string;
  date: string;
  destination: string;
  statut: boolean;
}

export interface Vehicule {
  id: number;
  plaque: string;
  type: string;
  capacite: number;
}

export interface Affectation {
  id: number;
  date: string;
}

export interface Rapport {
  id: number;
  titre: string;
  texte: string;
  date: string;
}

export interface Agent {
  id: number;
  prenom: string;
  nom: string;
  username: string;
  adresse: string;
}

export interface Chauffeur {
  id: number;
  nom: string;
  prenom: string;
  username: string;
}

export interface ChefGarage {
  id: number;
  nom: string;
  prenom: string;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  user: any;
}
