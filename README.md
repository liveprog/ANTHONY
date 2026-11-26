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

**Programme** — la salle n'est possible que du **jeudi au dimanche**, et le footing ne se fait
jamais le même jour que la salle : **4 séances de salle**, **2 footings** faciles sur les jours sans
salle et **1 jour de repos complet**. **Lundi** : footing de 25 min (facultatif). **Mardi** : repos.
**Mercredi** : petit footing de 20 min (facultatif). **Jeudi** : **Haut du corps** (≈ 30-35 min,
lourd : développé militaire + tirage vertical, développé couché + tirage horizontal, élévations
latérales + tirage à la corde, curl aux haltères + extensions triceps, tout enchaîné par paires).
**Vendredi** : **Bas du corps** (≈ 30-35 min, uniquement les jambes : squat ou presse + mollets,
soulevé de terre roumain, fentes + curl des ischios). **Samedi** : **Tractions · Dips · Abdos**
(≈ 55 min : tractions et dips assistés, descentes lentes, élévations latérales + curl à la barre,
relevés de jambes + crunch). **Dimanche** : petit **Full body** (≈ 30 min : squat ou presse,
développé incliné, tirage horizontal, planche).

L'ordre alterne haut et bas du corps : les jambes ne tombent jamais deux jours de suite, les deux
séances lourdes de haut du corps (jeudi, samedi) sont séparées de 48 h, et le seul enchaînement de
haut du corps est samedi → dimanche, avec le full body léger. Les séances gardent presque toutes
leurs séries (24, 15, 26 et 12) grâce aux enchaînements par paires, où le repos est partagé, avec des
charges lourdes (6-8 répétitions sur les gros mouvements) et la dernière série à l'échec sur les
tirages et l'isolation. Chaque séance se termine par la marche inclinée (pente 6 %, 4,5 km/h). Les
abdos sont travaillés deux fois (samedi et dimanche, avec des exercices différents). La liste « La
semaine » affiche les muscles travaillés chaque jour.

Dans `src/data/programme.ts`, `id` est l'identité stable d'une séance et `jour` le jour où elle a
lieu : le haut du corps (identifiant `lundi`) se fait le jeudi, le bas du corps (`mardi`) le vendredi
et tractions · dips · abdos (`tractions-vendredi`) le samedi. Les séances ont été déplacées sans
renommer leurs identifiants, pour que leurs temps de repos personnalisés, la séance en cours et les
exceptions les suivent. Les réglages d'un exercice qui n'est plus dans une séance ne s'affichent
plus.

Un jour peut être remplacé à une date précise : `EXCEPTIONS` associe une date à une séance du
programme (la liste est vide pour l'instant), `jourDuJour()` la respecte, et l'accueil affiche la
raison ainsi que le vrai jour de la semaine ; une exception passée ne s'affiche plus.

Le temps de repos est porté par le programme, **séance par séance** : il s'affiche en pastille à
côté de chaque exercice, le même exercice pouvant être enchaîné un jour (0 s) et posé un autre
(60 s). Chaque valeur se modifie par pas de 15 s, dans le détail d'un jour ou sur la fiche de
l'exercice, et la modification est enregistrée pour ce jour-là seulement (clé `jour:exercice`).

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

## Sans connexion

L'app est entièrement locale : une fois chargée, elle n'a besoin d'aucun réseau (aucune police ni
ressource externe, la police Inter est embarquée). Trois façons de l'utiliser sans connexion :

- **Page déjà ouverte** (y compris dans l'artefact claude.ai) : si le réseau coupe en pleine
  séance, tout continue de marcher. Ce qui n'est pas encore dans la sauvegarde en ligne est compté
  « en attente » (visible dans Séance et Réglages) et part tout seul au retour du réseau, sans
  recharger la page (`src/lib/sync.ts` : délais d'attente, reprise sur l'événement `online`,
  au retour au premier plan et toutes les 20 s).
- **App installée** : `npm run build` produit dans `dist/` une app installable (manifeste, icônes
  et service worker `sw.js`). Hébergée en https, elle met tous ses fichiers en cache à la première
  visite et s'ouvre ensuite sans connexion, avec ses graphiques. Le service worker n'est volontairement
  pas activé dans l'artefact claude.ai (page republiée à chaque version, un cache permanent y
  servirait d'anciennes versions).
- **Fichier unique** : `npm run build:offline` produit `dist-offline/antho-fit-hors-ligne.html`
  (≈ 800 ko, tout dedans) qui s'ouvre directement depuis le disque.

Hors artefact, il n'y a pas de sauvegarde en ligne : les données restent sur l'appareil, et
l'export/import JSON (onglet Progrès) sert de passerelle. L'import **fusionne** (par identifiant)
au lieu de remplacer : rien n'est supprimé, et une séance présente des deux côtés prend la
version du fichier.

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
