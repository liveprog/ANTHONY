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

Aucun backend à écrire : publiée comme artefact claude.ai, l'app enregistre ses données dans la
base de l'artefact (capacité `db`), dans le sous-arbre privé du compte qui regarde la page —
elles survivent donc à la fermeture de la page et suivent d'un appareil à l'autre. En dehors de
ce contexte (dev local, hébergement statique), elle retombe sur le `localStorage`
(clés versionnées `anthofit.v1.*`), qui sert aussi de cache et de secours hors ligne.

## Les quatre onglets

**Programme** — la semaine complète, du samedi au vendredi : Pecs·Épaules·Bras (≈ 1 h), repos,
Jambes (≈ 1 h), marche inclinée facultative, Dos·Biceps (≈ 1 h), Sprint·Street (≈ 50 min),
Corps entier (≈ 1 h). Chaque jour détaille ses exercices, ses séries, ses séries à l'échec et
ses enchaînements (deux exercices sans repos entre les deux).

Le temps de repos est porté par le programme, **séance par séance** : le même exercice peut être
enchaîné un jour (0 s) et posé un autre (60 s). Chaque valeur se modifie par pas de 15 s, dans le
détail d'un jour ou sur la fiche de l'exercice, et la modification est enregistrée pour ce jour-là
seulement (clé `jour:exercice`).

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

## La sauvegarde

`src/lib/sync.ts` tient la persistance. Au démarrage il demande `claude.use('db')` et
`claude.use('user')` : s'il obtient les deux, il charge le document `data/users/<id>/antho-fit`
(réglages, repos personnalisés, séance en cours) et les collections `seances` et `repas`, fusionne
avec ce qui est déjà local — l'union par identifiant, jamais un écrasement — puis écrit les
différences à chaque changement, groupées après 400 ms. `visibilitychange`, `pagehide` et `blur`
déclenchent l'écriture immédiatement : c'est là qu'une séance se perdait. Si la photo d'un repas
fait dépasser le quota, le repas est réenregistré sans elle plutôt que perdu.

Sans base disponible, l'app bascule en mode local et **le dit** : bandeau dans Séance, Progrès et
Réglages. Une écriture `localStorage` qui échoue n'est plus avalée en silence — elle déclenche un
avertissement rouge, parce qu'une sauvegarde qui ment est pire que pas de sauvegarde.

## Bon à savoir

- L'export JSON de l'onglet Progrès reste la copie à garder chez soi, surtout en mode local.
- Le bip de fin de repos utilise l’API Web Audio et démarre au premier appui ; la vibration
  dépend du navigateur (surtout Android).
- Les valeurs nutritionnelles de la base alimentaire sont des moyennes arrondies pour 100 g.
