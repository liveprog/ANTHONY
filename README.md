# Antho Fit

Application web de programme sportif, de suivi de séances et de comptage de calories par photo.
Interface en français, thème sombre, accent vert lime, pensée pour le pouce.

Sur un ordinateur, l’app s’affiche dans une **maquette d’iPhone** (390 × 844, coins arrondis,
encoche, barre d’accueil). Sur un écran de moins de 500 px, la maquette disparaît et l’app passe
en plein écran.

## Démarrer

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production dans dist/
npm run preview  # prévisualise le build
```

Aucun backend : tout tourne dans le navigateur et tout est enregistré en `localStorage`
(clés versionnées `anthofit.v1.*`).

## Les quatre onglets

**Programme** — la semaine complète, du samedi au vendredi : Pecs·Épaules·Bras, repos, Jambes,
deux jours libres (marche inclinée optionnelle), Sprint + street, Full body. Chaque jour détaille
ses exercices, ses séries et son temps de repos, modifiable par pas de 15 s et sauvegardé.

**Séance** — le suivi en direct. Poids et répétitions sont préremplis avec la dernière séance,
« valider la série » lance le chronomètre de repos (bip + vibration en fin), tout est sauvegardé
en continu, et « terminer la séance » affiche le volume total et les records battus.

**Calories** — le repas est photographié, analysé localement (voir plus bas), puis corrigé à la
main : grammages, remplacement d’un aliment, ajout depuis la base. Anneau de calories, barres de
macros, objectifs réglables, historique des sept derniers jours.

**Progrès** — courbes de charge max et de volume par exercice (recharts), records personnels,
export et import JSON de toutes les données.

### Fiche exercice

Un appui sur un exercice ouvre sa fiche. Elle commence par le **tuto animé** : un mannequin
articulé en SVG rejoue le mouvement en boucle (départ, descente, poussée…), avec bouton
pause et vitesse ×0,5, et les étapes d'exécution écrites en dessous, celle en cours étant
surlignée au rythme de l'animation. Les animations respectent `prefers-reduced-motion` : elles
démarrent en pause si le système demande de limiter les animations.

Vient ensuite le bonhomme SVG de face et de dos (bouton pour basculer)
avec les seize groupes musculaires dessinés séparément — pectoraux, deltoïdes antérieurs /
latéraux / postérieurs, biceps, triceps, avant-bras, abdos, obliques, trapèzes, dorsaux,
lombaires, fessiers, quadriceps, ischio-jambiers, mollets. Les muscles principaux sont en vert
vif, les secondaires en vert pâle, le reste en gris foncé, avec légende. La fiche donne aussi
trois à quatre conseils de technique, l’erreur classique à éviter, le temps de repos modifiable
et l’historique des dernières performances.

## L’estimation par photo (« Bouchée »)

Il n’y a ni serveur ni modèle de vision : la photo est réduite, puis le disque central de l’image
est échantillonné et chaque pixel classé par teinte (vert, rouge, doré, jaune, clair). Les
proportions obtenues donnent une composition d’assiette plausible — légumes, féculent, grillé —
avec des grammages de départ, à corriger ensuite à la main. C’est une base de saisie rapide, pas
une pesée, et l’app le dit clairement à l’écran.

Les photos sont compressées (420 px, JPEG) avant d’être stockées, et celles des repas de plus de
21 jours sont effacées automatiquement pour ne pas saturer le `localStorage`.

## Structure

```
src/
  data/        programme de la semaine, catalogue d'exercices, muscles, animations, étapes,
               base alimentaire
  lib/         stockage versionné, calculs (volume, records, historique), chrono, analyse photo
  components/  maquette d'iPhone, bonhomme SVG, mannequin animé, chrono de repos, éditeur de
               repas, primitives UI
  screens/     Programme, JourDetail, FicheExercice, Séance, Calories, Progrès, Réglages
```

## Les animations

Chaque exercice a une suite de poses clés (`src/data/animations.ts`). Une pose est un jeu
d'angles — inclinaison du torse, bras, avant-bras, cuisse, tibia, pied — et la position du
bassin ; le composant calcule les articulations par cinématique directe, interpole d'une pose
à la suivante avec un lissage, et dessine le matériel (barre, haltères, banc, poulie, barre
fixe, roue) accroché aux poignets calculés. Ajouter un exercice, c'est écrire ses poses et ses
étapes : aucun fichier vidéo, aucune image.

## Bon à savoir

- Les données restent sur l’appareil : exporte le JSON depuis l’onglet Progrès avant de changer
  de téléphone ou de vider le cache du navigateur.
- Le bip de fin de repos utilise l’API Web Audio et démarre au premier appui ; la vibration
  dépend du navigateur (surtout Android).
- Les valeurs nutritionnelles de la base alimentaire sont des moyennes arrondies pour 100 g.
