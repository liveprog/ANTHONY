import type { Aliment } from '../lib/types'

/** Valeurs pour 100 g (ou 100 ml), arrondies. `portion` = portion courante en grammes. */
export const ALIMENTS: Aliment[] = [
  { nom: 'Blanc de poulet grillé', kcal: 165, prot: 31, gluc: 0, lip: 3.6, portion: 150, unite: 'g', categorie: 'proteine' },
  { nom: 'Cuisse de poulet', kcal: 209, prot: 26, gluc: 0, lip: 11, portion: 150, unite: 'g', categorie: 'proteine' },
  { nom: 'Steak haché 5 %', kcal: 137, prot: 21, gluc: 0, lip: 5, portion: 150, unite: 'g', categorie: 'proteine' },
  { nom: 'Steak haché 15 %', kcal: 215, prot: 19, gluc: 0, lip: 15, portion: 150, unite: 'g', categorie: 'proteine' },
  { nom: 'Bœuf (bavette, grillée)', kcal: 220, prot: 27, gluc: 0, lip: 12, portion: 150, unite: 'g', categorie: 'proteine' },
  { nom: 'Dinde (escalope)', kcal: 135, prot: 29, gluc: 0, lip: 1.5, portion: 150, unite: 'g', categorie: 'proteine' },
  { nom: 'Saumon', kcal: 206, prot: 22, gluc: 0, lip: 13, portion: 130, unite: 'g', categorie: 'proteine' },
  { nom: 'Thon au naturel', kcal: 116, prot: 26, gluc: 0, lip: 1, portion: 120, unite: 'g', categorie: 'proteine' },
  { nom: 'Cabillaud', kcal: 82, prot: 18, gluc: 0, lip: 0.7, portion: 150, unite: 'g', categorie: 'proteine' },
  { nom: 'Crevettes', kcal: 99, prot: 24, gluc: 0.2, lip: 0.3, portion: 120, unite: 'g', categorie: 'proteine' },
  { nom: 'Œuf entier', kcal: 143, prot: 13, gluc: 0.7, lip: 10, portion: 55, unite: 'g (1 œuf)', categorie: 'proteine' },
  { nom: 'Blanc d’œuf', kcal: 52, prot: 11, gluc: 0.7, lip: 0.2, portion: 100, unite: 'g', categorie: 'proteine' },
  { nom: 'Jambon blanc', kcal: 110, prot: 20, gluc: 1, lip: 3, portion: 80, unite: 'g', categorie: 'proteine' },
  { nom: 'Tofu ferme', kcal: 144, prot: 15, gluc: 3, lip: 8, portion: 150, unite: 'g', categorie: 'proteine' },
  { nom: 'Lentilles cuites', kcal: 116, prot: 9, gluc: 20, lip: 0.4, portion: 200, unite: 'g', categorie: 'proteine' },
  { nom: 'Pois chiches cuits', kcal: 164, prot: 9, gluc: 27, lip: 2.6, portion: 180, unite: 'g', categorie: 'proteine' },
  { nom: 'Whey (poudre)', kcal: 400, prot: 80, gluc: 7, lip: 6, portion: 30, unite: 'g (1 dose)', categorie: 'proteine' },

  { nom: 'Riz blanc cuit', kcal: 130, prot: 2.7, gluc: 28, lip: 0.3, portion: 200, unite: 'g', categorie: 'feculent' },
  { nom: 'Riz complet cuit', kcal: 123, prot: 2.7, gluc: 26, lip: 1, portion: 200, unite: 'g', categorie: 'feculent' },
  { nom: 'Pâtes cuites', kcal: 158, prot: 6, gluc: 31, lip: 0.9, portion: 220, unite: 'g', categorie: 'feculent' },
  { nom: 'Semoule / couscous cuit', kcal: 112, prot: 4, gluc: 23, lip: 0.2, portion: 200, unite: 'g', categorie: 'feculent' },
  { nom: 'Quinoa cuit', kcal: 120, prot: 4.4, gluc: 21, lip: 1.9, portion: 180, unite: 'g', categorie: 'feculent' },
  { nom: 'Pomme de terre cuite', kcal: 87, prot: 2, gluc: 20, lip: 0.1, portion: 250, unite: 'g', categorie: 'feculent' },
  { nom: 'Patate douce cuite', kcal: 90, prot: 2, gluc: 21, lip: 0.2, portion: 220, unite: 'g', categorie: 'feculent' },
  { nom: 'Frites', kcal: 312, prot: 3.4, gluc: 41, lip: 15, portion: 150, unite: 'g', categorie: 'feculent' },
  { nom: 'Pain complet', kcal: 247, prot: 10, gluc: 41, lip: 3.4, portion: 60, unite: 'g (2 tranches)', categorie: 'feculent' },
  { nom: 'Baguette', kcal: 270, prot: 9, gluc: 55, lip: 1, portion: 80, unite: 'g', categorie: 'feculent' },
  { nom: 'Flocons d’avoine', kcal: 379, prot: 13, gluc: 60, lip: 7, portion: 80, unite: 'g', categorie: 'feculent' },
  { nom: 'Galette de blé / wrap', kcal: 300, prot: 8, gluc: 50, lip: 7, portion: 70, unite: 'g', categorie: 'feculent' },
  { nom: 'Pizza (part)', kcal: 266, prot: 11, gluc: 33, lip: 10, portion: 200, unite: 'g', categorie: 'feculent' },

  { nom: 'Brocoli', kcal: 34, prot: 2.8, gluc: 7, lip: 0.4, portion: 200, unite: 'g', categorie: 'legume' },
  { nom: 'Haricots verts', kcal: 31, prot: 1.8, gluc: 7, lip: 0.1, portion: 200, unite: 'g', categorie: 'legume' },
  { nom: 'Courgette', kcal: 17, prot: 1.2, gluc: 3.1, lip: 0.3, portion: 200, unite: 'g', categorie: 'legume' },
  { nom: 'Salade verte', kcal: 15, prot: 1.4, gluc: 2.9, lip: 0.2, portion: 100, unite: 'g', categorie: 'legume' },
  { nom: 'Tomate', kcal: 18, prot: 0.9, gluc: 3.9, lip: 0.2, portion: 150, unite: 'g', categorie: 'legume' },
  { nom: 'Carotte', kcal: 41, prot: 0.9, gluc: 10, lip: 0.2, portion: 150, unite: 'g', categorie: 'legume' },
  { nom: 'Poivron', kcal: 26, prot: 1, gluc: 6, lip: 0.3, portion: 150, unite: 'g', categorie: 'legume' },
  { nom: 'Épinards cuits', kcal: 23, prot: 2.9, gluc: 3.6, lip: 0.4, portion: 200, unite: 'g', categorie: 'legume' },
  { nom: 'Ratatouille', kcal: 60, prot: 1.4, gluc: 6, lip: 3.4, portion: 250, unite: 'g', categorie: 'legume' },
  { nom: 'Champignons', kcal: 22, prot: 3.1, gluc: 3.3, lip: 0.3, portion: 150, unite: 'g', categorie: 'legume' },
  { nom: 'Avocat', kcal: 160, prot: 2, gluc: 9, lip: 15, portion: 100, unite: 'g (1/2)', categorie: 'matiere-grasse' },

  { nom: 'Banane', kcal: 89, prot: 1.1, gluc: 23, lip: 0.3, portion: 120, unite: 'g', categorie: 'fruit' },
  { nom: 'Pomme', kcal: 52, prot: 0.3, gluc: 14, lip: 0.2, portion: 160, unite: 'g', categorie: 'fruit' },
  { nom: 'Orange', kcal: 47, prot: 0.9, gluc: 12, lip: 0.1, portion: 180, unite: 'g', categorie: 'fruit' },
  { nom: 'Fraises', kcal: 32, prot: 0.7, gluc: 7.7, lip: 0.3, portion: 150, unite: 'g', categorie: 'fruit' },
  { nom: 'Myrtilles', kcal: 57, prot: 0.7, gluc: 14, lip: 0.3, portion: 100, unite: 'g', categorie: 'fruit' },
  { nom: 'Raisin', kcal: 69, prot: 0.7, gluc: 18, lip: 0.2, portion: 150, unite: 'g', categorie: 'fruit' },
  { nom: 'Mangue', kcal: 60, prot: 0.8, gluc: 15, lip: 0.4, portion: 150, unite: 'g', categorie: 'fruit' },
  { nom: 'Dattes', kcal: 282, prot: 2.5, gluc: 75, lip: 0.4, portion: 40, unite: 'g', categorie: 'fruit' },

  { nom: 'Fromage blanc 0 %', kcal: 47, prot: 8, gluc: 4, lip: 0.2, portion: 200, unite: 'g', categorie: 'laitier' },
  { nom: 'Skyr / yaourt grec 0 %', kcal: 60, prot: 10, gluc: 4, lip: 0.2, portion: 150, unite: 'g', categorie: 'laitier' },
  { nom: 'Yaourt nature', kcal: 61, prot: 3.5, gluc: 4.7, lip: 3.3, portion: 125, unite: 'g', categorie: 'laitier' },
  { nom: 'Lait demi-écrémé', kcal: 46, prot: 3.3, gluc: 4.8, lip: 1.6, portion: 250, unite: 'ml', categorie: 'laitier' },
  { nom: 'Mozzarella', kcal: 280, prot: 22, gluc: 2.2, lip: 20, portion: 60, unite: 'g', categorie: 'laitier' },
  { nom: 'Emmental / comté', kcal: 380, prot: 28, gluc: 1.5, lip: 29, portion: 30, unite: 'g', categorie: 'laitier' },
  { nom: 'Feta', kcal: 264, prot: 14, gluc: 4, lip: 21, portion: 50, unite: 'g', categorie: 'laitier' },

  { nom: 'Huile d’olive', kcal: 884, prot: 0, gluc: 0, lip: 100, portion: 10, unite: 'g (1 c. à s.)', categorie: 'matiere-grasse' },
  { nom: 'Beurre', kcal: 717, prot: 0.9, gluc: 0.1, lip: 81, portion: 10, unite: 'g', categorie: 'matiere-grasse' },
  { nom: 'Amandes', kcal: 579, prot: 21, gluc: 22, lip: 50, portion: 30, unite: 'g', categorie: 'matiere-grasse' },
  { nom: 'Noix de cajou', kcal: 553, prot: 18, gluc: 30, lip: 44, portion: 30, unite: 'g', categorie: 'matiere-grasse' },
  { nom: 'Beurre de cacahuète', kcal: 588, prot: 25, gluc: 20, lip: 50, portion: 20, unite: 'g', categorie: 'matiere-grasse' },
  { nom: 'Mayonnaise', kcal: 680, prot: 1, gluc: 1.5, lip: 75, portion: 15, unite: 'g', categorie: 'matiere-grasse' },
  { nom: 'Sauce tomate', kcal: 55, prot: 1.6, gluc: 8, lip: 1.8, portion: 100, unite: 'g', categorie: 'legume' },

  { nom: 'Chocolat noir 70 %', kcal: 598, prot: 7.8, gluc: 46, lip: 43, portion: 25, unite: 'g', categorie: 'sucre' },
  { nom: 'Cookie / biscuit', kcal: 480, prot: 6, gluc: 62, lip: 23, portion: 40, unite: 'g', categorie: 'sucre' },
  { nom: 'Croissant', kcal: 406, prot: 8, gluc: 45, lip: 21, portion: 60, unite: 'g', categorie: 'sucre' },
  { nom: 'Crêpe sucrée', kcal: 220, prot: 6, gluc: 32, lip: 7, portion: 90, unite: 'g', categorie: 'sucre' },
  { nom: 'Glace (2 boules)', kcal: 207, prot: 3.5, gluc: 24, lip: 11, portion: 100, unite: 'g', categorie: 'sucre' },
  { nom: 'Miel', kcal: 304, prot: 0.3, gluc: 82, lip: 0, portion: 20, unite: 'g', categorie: 'sucre' },

  { nom: 'Soda', kcal: 42, prot: 0, gluc: 10.6, lip: 0, portion: 330, unite: 'ml', categorie: 'boisson' },
  { nom: 'Jus d’orange', kcal: 45, prot: 0.7, gluc: 10, lip: 0.2, portion: 250, unite: 'ml', categorie: 'boisson' },
  { nom: 'Bière', kcal: 43, prot: 0.5, gluc: 3.6, lip: 0, portion: 330, unite: 'ml', categorie: 'boisson' },
  { nom: 'Café noir', kcal: 2, prot: 0.1, gluc: 0, lip: 0, portion: 200, unite: 'ml', categorie: 'boisson' },
]

export const LIBELLE_CATEGORIE_ALIMENT: Record<Aliment['categorie'], string> = {
  proteine: 'Protéines',
  feculent: 'Féculents',
  legume: 'Légumes',
  fruit: 'Fruits',
  laitier: 'Produits laitiers',
  'matiere-grasse': 'Matières grasses',
  sucre: 'Sucré',
  boisson: 'Boissons',
}

function sansAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .toLowerCase()
}

export function chercherAliments(requete: string, limite = 20): Aliment[] {
  const q = sansAccents(requete.trim())
  if (!q) return ALIMENTS.slice(0, limite)
  return ALIMENTS.filter((a) => sansAccents(a.nom).includes(q)).slice(0, limite)
}

export function alimentParNom(nom: string): Aliment | undefined {
  return ALIMENTS.find((a) => a.nom === nom)
}
