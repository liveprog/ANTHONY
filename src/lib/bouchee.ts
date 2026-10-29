import { ALIMENTS, alimentParNom } from '../data/aliments'
import type { Aliment, CategorieAliment, LigneRepas } from './types'
import { identifiant } from './donnees'

/**
 * « Bouchée » : estimation locale d'une assiette à partir d'une photo.
 *
 * Tout tourne dans le navigateur, sans serveur ni modèle de vision : on mesure
 * la répartition des couleurs au centre de l'image et on en déduit une
 * composition plausible (part de légumes, de féculents, de protéines...).
 * C'est une base de départ à corriger à la main, pas une pesée.
 */

export type Teinte = 'vert' | 'rouge' | 'dore' | 'jaune' | 'clair' | 'sombre'

export type PartDetectee = {
  teinte: Teinte
  proportion: number
  categorie: CategorieAliment
  alimentPropose: string
  grammes: number
}

export type Analyse = {
  parts: PartDetectee[]
  lignes: LigneRepas[]
  masseEstimee: number
  fiabilite: 'faible' | 'moyenne'
  message: string
}

const PROPOSITIONS: Record<Exclude<Teinte, 'sombre'>, { categorie: CategorieAliment; aliment: string; libelle: string }> = {
  vert: { categorie: 'legume', aliment: 'Brocoli', libelle: 'Légumes verts' },
  rouge: { categorie: 'legume', aliment: 'Tomate', libelle: 'Tomate / sauce' },
  dore: { categorie: 'proteine', aliment: 'Blanc de poulet grillé', libelle: 'Viande ou poisson grillé' },
  jaune: { categorie: 'feculent', aliment: 'Pâtes cuites', libelle: 'Pâtes, œuf, fromage' },
  clair: { categorie: 'feculent', aliment: 'Riz blanc cuit', libelle: 'Riz, semoule, pomme de terre' },
}

export const LIBELLE_TEINTE: Record<Teinte, string> = {
  vert: 'Légumes verts',
  rouge: 'Tomate / sauce',
  dore: 'Grillé (viande, poisson)',
  jaune: 'Pâtes, œuf, fromage',
  clair: 'Riz, féculent clair',
  sombre: 'Indéterminé',
}

function rgbVersHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  return [h, s, max]
}

function classer(h: number, s: number, v: number): Teinte {
  if (v < 0.16) return 'sombre'
  if (s < 0.14) return v > 0.6 ? 'clair' : 'sombre'
  if (h >= 70 && h < 175) return 'vert'
  if (h >= 175 && h < 320) return 'sombre'
  if (h >= 320 || h < 18) return 'rouge'
  if (h >= 18 && h < 45) return 'dore'
  return 'jaune'
}

/** Réduit et compresse une image pour tenir dans le localStorage. */
export function compresserImage(fichier: File, cote = 420, qualite = 0.62): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader()
    lecteur.onerror = () => reject(new Error('Lecture du fichier impossible.'))
    lecteur.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image illisible.'))
      img.onload = () => {
        const ratio = Math.min(1, cote / Math.max(img.width, img.height))
        const l = Math.max(1, Math.round(img.width * ratio))
        const haut = Math.max(1, Math.round(img.height * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = l
        canvas.height = haut
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas indisponible.'))
        ctx.drawImage(img, 0, 0, l, haut)
        resolve(canvas.toDataURL('image/jpeg', qualite))
      }
      img.src = String(lecteur.result)
    }
    lecteur.readAsDataURL(fichier)
  })
}

export function analyserImage(dataUrl: string): Promise<Analyse> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error('Image illisible.'))
    img.onload = () => {
      const cote = 96
      const canvas = document.createElement('canvas')
      canvas.width = cote
      canvas.height = cote
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas indisponible.'))
      ctx.drawImage(img, 0, 0, cote, cote)
      const { data } = ctx.getImageData(0, 0, cote, cote)

      const compte: Record<Teinte, number> = { vert: 0, rouge: 0, dore: 0, jaune: 0, clair: 0, sombre: 0 }
      const centre = (cote - 1) / 2
      const rayon = cote * 0.42
      let retenus = 0

      for (let y = 0; y < cote; y++) {
        for (let x = 0; x < cote; x++) {
          // On ne regarde que le disque central : les bords sont souvent la table ou le bord de l'assiette.
          const dx = x - centre
          const dy = y - centre
          if (dx * dx + dy * dy > rayon * rayon) continue
          const i = (y * cote + x) * 4
          const [h, s, v] = rgbVersHsv(data[i], data[i + 1], data[i + 2])
          const t = classer(h, s, v)
          compte[t] += 1
          if (t !== 'sombre') retenus += 1
        }
      }

      if (retenus < 40) {
        return resolve({
          parts: [],
          lignes: [],
          masseEstimee: 0,
          fiabilite: 'faible',
          message:
            'Photo trop sombre ou trop uniforme pour en tirer quoi que ce soit. Ajoute les aliments à la main, ou reprends la photo bien éclairée, à la verticale de l’assiette.',
        })
      }

      const teintes: Exclude<Teinte, 'sombre'>[] = ['vert', 'rouge', 'dore', 'jaune', 'clair']
      const brutes = teintes
        .map((t) => ({ teinte: t, proportion: compte[t] / retenus }))
        .filter((p) => p.proportion >= 0.08)
        .sort((a, b) => b.proportion - a.proportion)
        .slice(0, 4)

      const somme = brutes.reduce((t, p) => t + p.proportion, 0) || 1
      const masseEstimee = 420

      const parts: PartDetectee[] = brutes.map((p) => {
        const prop = p.proportion / somme
        const info = PROPOSITIONS[p.teinte]
        const grammes = Math.max(30, Math.round((prop * masseEstimee) / 10) * 10)
        return {
          teinte: p.teinte,
          proportion: prop,
          categorie: info.categorie,
          alimentPropose: info.aliment,
          grammes,
        }
      })

      resolve({
        parts,
        lignes: parts.map((p) => ligneDepuisAliment(alimentParNom(p.alimentPropose)!, p.grammes)),
        masseEstimee,
        fiabilite: parts.length >= 2 ? 'moyenne' : 'faible',
        message:
          'Estimation à partir des couleurs de la photo, pas d’une pesée : vérifie chaque ligne et corrige les grammages.',
      })
    }
    img.src = dataUrl
  })
}

export function ligneDepuisAliment(aliment: Aliment, grammes: number): LigneRepas {
  const k = grammes / 100
  return {
    id: identifiant('ligne'),
    nom: aliment.nom,
    grammes,
    kcal: Math.round(aliment.kcal * k),
    prot: Math.round(aliment.prot * k * 10) / 10,
    gluc: Math.round(aliment.gluc * k * 10) / 10,
    lip: Math.round(aliment.lip * k * 10) / 10,
  }
}

export function recalculerLigne(ligne: LigneRepas, grammes: number): LigneRepas {
  const aliment = alimentParNom(ligne.nom)
  if (!aliment) {
    const facteur = ligne.grammes > 0 ? grammes / ligne.grammes : 0
    return {
      ...ligne,
      grammes,
      kcal: Math.round(ligne.kcal * facteur),
      prot: Math.round(ligne.prot * facteur * 10) / 10,
      gluc: Math.round(ligne.gluc * facteur * 10) / 10,
      lip: Math.round(ligne.lip * facteur * 10) / 10,
    }
  }
  return { ...ligneDepuisAliment(aliment, grammes), id: ligne.id }
}

export function alternativesPour(categorie: CategorieAliment): Aliment[] {
  return ALIMENTS.filter((a) => a.categorie === categorie)
}

export const ASSIETTES_TYPES: { nom: string; description: string; lignes: { aliment: string; grammes: number }[] }[] = [
  {
    nom: 'Assiette prise de muscle',
    description: 'Poulet, riz, légumes verts, huile d’olive',
    lignes: [
      { aliment: 'Blanc de poulet grillé', grammes: 180 },
      { aliment: 'Riz blanc cuit', grammes: 250 },
      { aliment: 'Brocoli', grammes: 150 },
      { aliment: 'Huile d’olive', grammes: 10 },
    ],
  },
  {
    nom: 'Petit-déjeuner costaud',
    description: 'Avoine, skyr, banane, beurre de cacahuète',
    lignes: [
      { aliment: 'Flocons d’avoine', grammes: 80 },
      { aliment: 'Skyr / yaourt grec 0 %', grammes: 150 },
      { aliment: 'Banane', grammes: 120 },
      { aliment: 'Beurre de cacahuète', grammes: 20 },
    ],
  },
  {
    nom: 'Collation post-séance',
    description: 'Whey, banane, amandes',
    lignes: [
      { aliment: 'Whey (poudre)', grammes: 30 },
      { aliment: 'Banane', grammes: 120 },
      { aliment: 'Amandes', grammes: 25 },
    ],
  },
  {
    nom: 'Assiette sèche',
    description: 'Cabillaud, patate douce, haricots verts',
    lignes: [
      { aliment: 'Cabillaud', grammes: 180 },
      { aliment: 'Patate douce cuite', grammes: 200 },
      { aliment: 'Haricots verts', grammes: 200 },
    ],
  },
]
