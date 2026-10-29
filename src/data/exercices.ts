import type { MuscleId } from './muscles'

/** Catégorie d'effort : fixe le temps de repos par défaut. */
export type Categorie = 'compose' | 'moyen' | 'isolation'

/** Type de saisie pendant la séance. */
export type SaisieType = 'charge' | 'reps' | 'temps'

export const REPOS_PAR_DEFAUT: Record<Categorie, number> = {
  compose: 150,
  moyen: 90,
  isolation: 60,
}

export const LIBELLE_CATEGORIE: Record<Categorie, string> = {
  compose: 'Gros composé',
  moyen: 'Mouvement moyen',
  isolation: 'Isolation',
}

export type Exercice = {
  id: string
  nom: string
  categorie: Categorie
  saisie: SaisieType
  principaux: MuscleId[]
  secondaires: MuscleId[]
  conseils: string[]
  erreur: string
}

export const EXERCICES: Exercice[] = [
  {
    id: 'developpe-couche-barre',
    nom: 'Développé couché barre',
    categorie: 'compose',
    saisie: 'charge',
    principaux: ['pectoraux', 'deltoideAnterieur', 'triceps'],
    secondaires: ['avantBras', 'abdos', 'dorsaux'],
    conseils: [
      'Omoplates serrées et basses, poitrine haute : la barre descend sur un buste stable, pas sur des épaules qui roulent vers l’avant.',
      'Barre au niveau du bas des pectoraux, coudes à environ 45-60° du buste, jamais complètement écartés.',
      'Pieds bien ancrés au sol et fessiers en contact avec le banc : la poussée part des jambes et traverse le tronc.',
      'Descente contrôlée en 2 s, léger contact avec la poitrine, puis poussée franche sans rebond.',
    ],
    erreur: 'Faire rebondir la barre sur la poitrine en décollant les fessiers : la charge monte, les pectoraux travaillent moins et les épaules prennent tout.',
  },
  {
    id: 'rowing-haltere-un-bras',
    nom: 'Rowing haltère un bras',
    categorie: 'moyen',
    saisie: 'charge',
    principaux: ['dorsaux', 'trapezes', 'deltoidePosterieur'],
    secondaires: ['biceps', 'avantBras', 'lombaires', 'obliques'],
    conseils: [
      'Dos à plat, buste quasi parallèle au sol, main libre en appui : le bassin reste fixe pendant toute la série.',
      'Tire le coude vers la hanche, pas vers l’épaule, et laisse l’omoplate glisser vers l’arrière en fin de mouvement.',
      'Allonge complètement le bras en bas pour étirer le dorsal avant chaque répétition.',
      'Même nombre de répétitions des deux côtés, en commençant par le côté faible.',
    ],
    erreur: 'Tourner le buste pour arracher la charge : c’est la rotation du tronc qui monte l’haltère, plus le dos.',
  },
  {
    id: 'developpe-militaire-halteres',
    nom: 'Développé militaire haltères',
    categorie: 'compose',
    saisie: 'charge',
    principaux: ['deltoideAnterieur', 'deltoideLateral', 'triceps'],
    secondaires: ['trapezes', 'abdos', 'pectoraux'],
    conseils: [
      'Gaine fort les abdos et les fessiers : pas de cambrure lombaire pour compenser le manque de mobilité d’épaule.',
      'Les haltères partent au niveau des oreilles, coudes légèrement en avant du plan du corps.',
      'Monte jusqu’à verrouiller les coudes, poignets au-dessus des épaules, sans cogner les haltères en haut.',
      'Descends jusqu’à ce que les coudes passent sous la ligne des épaules pour une amplitude complète.',
    ],
    erreur: 'Transformer le mouvement en développé incliné debout en se cambrant : les lombaires encaissent et les épaules perdent le travail.',
  },
  {
    id: 'chest-press-incline-machine',
    nom: 'Développé incliné machine (chest press incliné)',
    categorie: 'moyen',
    saisie: 'charge',
    principaux: ['pectoraux', 'deltoideAnterieur'],
    secondaires: ['triceps', 'deltoideLateral'],
    conseils: [
      'Règle le siège pour que les poignées soient au niveau du haut des pectoraux.',
      'Dos collé au dossier, omoplates serrées : le buste ne doit pas décoller à la poussée.',
      'Poussée franche, puis retour lent (3 s) jusqu’à sentir l’étirement du haut des pecs.',
      'Garde une petite flexion de coude en fin de poussée pour ne pas transférer la tension sur l’articulation.',
    ],
    erreur: 'Charger trop lourd et ne faire qu’un quart d’amplitude : le haut des pectoraux ne reçoit pratiquement rien.',
  },
  {
    id: 'elevations-laterales',
    nom: 'Élévations latérales',
    categorie: 'isolation',
    saisie: 'charge',
    principaux: ['deltoideLateral'],
    secondaires: ['deltoideAnterieur', 'trapezes'],
    conseils: [
      'Buste légèrement penché en avant, coudes très légèrement fléchis et figés.',
      'Monte jusqu’à l’horizontale, pas plus haut : au-delà ce sont les trapèzes qui prennent le relais.',
      'Pense à mener le mouvement avec les coudes, pas avec les mains.',
      'Descente freinée en 2-3 s : c’est là que le deltoïde latéral travaille le plus.',
    ],
    erreur: 'Balancer le buste et hausser les épaules pour lancer les haltères : le deltoïde est court-circuité par les trapèzes.',
  },
  {
    id: 'curl-biceps-barre',
    nom: 'Curl biceps barre',
    categorie: 'isolation',
    saisie: 'charge',
    principaux: ['biceps'],
    secondaires: ['avantBras', 'deltoideAnterieur'],
    conseils: [
      'Coudes collés au buste et immobiles : ils servent de charnière, pas de levier.',
      'Monte sans reculer les épaules, serre les biceps en haut une demi-seconde.',
      'Déroule complètement les bras en bas, sans lâcher la tension.',
      'Poignets neutres et solides : si la barre te casse les poignets, passe à une barre EZ.',
    ],
    erreur: 'Donner un coup de reins à chaque répétition : la charge paraît plus lourde mais le biceps travaille moins et les lombaires trinquent.',
  },
  {
    id: 'crunch-poulie-haute',
    nom: 'Crunch poulie haute',
    categorie: 'isolation',
    saisie: 'charge',
    principaux: ['abdos'],
    secondaires: ['obliques'],
    conseils: [
      'À genoux sous la poulie, corde de chaque côté du visage, hanches fixes.',
      'Enroule la colonne vertèbre par vertèbre en rapprochant les côtes du bassin.',
      'Expire à fond en fin de contraction pour vider la cage et contracter davantage.',
      'Remonte lentement en gardant la tension, sans laisser la charge te redresser.',
    ],
    erreur: 'Plier les hanches au lieu d’enrouler le dos : ce sont les fléchisseurs de hanche qui tirent, pas les abdos.',
  },
  {
    id: 'squat-ou-presse',
    nom: 'Squat ou presse',
    categorie: 'compose',
    saisie: 'charge',
    principaux: ['quadriceps', 'fessiers'],
    secondaires: ['ischios', 'lombaires', 'abdos', 'mollets'],
    conseils: [
      'Prends une grande inspiration, gaine le ventre puis descends : le tronc reste un bloc.',
      'Genoux dans l’axe des pieds, poids réparti sur tout le pied, pas seulement sur les orteils.',
      'Descends au moins jusqu’à la cuisse parallèle au sol si ta mobilité le permet.',
      'À la presse, ne verrouille pas les genoux en haut et ne laisse pas le bas du dos s’arrondir en bas.',
    ],
    erreur: 'Laisser le bassin basculer en arrière (butt wink) en bas de l’amplitude : les lombaires encaissent la charge.',
  },
  {
    id: 'souleve-de-terre-roumain',
    nom: 'Soulevé de terre roumain',
    categorie: 'compose',
    saisie: 'charge',
    principaux: ['ischios', 'fessiers'],
    secondaires: ['lombaires', 'dorsaux', 'trapezes', 'avantBras'],
    conseils: [
      'Genoux à peine fléchis et figés : le mouvement vient de la bascule des hanches vers l’arrière.',
      'Barre collée aux cuisses tout du long, dos totalement plat.',
      'Descends jusqu’à sentir un étirement net des ischios (souvent à mi-tibia), pas plus bas.',
      'Remonte en poussant le bassin vers l’avant et en serrant les fessiers en haut.',
    ],
    erreur: 'Arrondir le bas du dos pour descendre plus bas : les ischios lâchent le travail et le disque lombaire le récupère.',
  },
  {
    id: 'fentes-marchees',
    nom: 'Fentes marchées',
    categorie: 'moyen',
    saisie: 'charge',
    principaux: ['quadriceps', 'fessiers'],
    secondaires: ['ischios', 'mollets', 'abdos', 'obliques'],
    conseils: [
      'Buste droit, regard loin devant : pas de penché vers l’avant à chaque pas.',
      'Grand pas, genou arrière qui descend près du sol, genou avant au-dessus du pied.',
      'Pousse avec le talon de la jambe avant pour enchaîner le pas suivant.',
      'Compte les répétitions par jambe, pas au total.',
    ],
    erreur: 'Faire des pas trop courts : le genou avant part loin devant les orteils et la charge passe dans l’articulation.',
  },
  {
    id: 'leg-curl',
    nom: 'Leg curl',
    categorie: 'isolation',
    saisie: 'charge',
    principaux: ['ischios'],
    secondaires: ['mollets', 'fessiers'],
    conseils: [
      'Aligne l’axe de la machine avec l’axe de tes genoux avant de commencer.',
      'Bassin collé au siège : s’il se soulève, la charge est trop lourde.',
      'Serre les ischios en fin de flexion une demi-seconde.',
      'Retour lent et complet, sans laisser la charge taper la butée.',
    ],
    erreur: 'Décoller les hanches et lâcher la phase négative : l’amplitude utile disparaît.',
  },
  {
    id: 'mollets-debout',
    nom: 'Mollets debout',
    categorie: 'isolation',
    saisie: 'charge',
    principaux: ['mollets'],
    secondaires: ['ischios'],
    conseils: [
      'Amplitude maximale : talon bien bas en étirement, puis montée sur la pointe des pieds.',
      'Marque une pause d’une seconde en haut et en bas, sans rebondir.',
      'Genoux tendus (pas verrouillés en force) pour cibler le gastrocnémien.',
      'Appuie sur l’avant du pied, pas sur le bord externe.',
    ],
    erreur: 'Enchaîner de petits rebonds rapides : c’est le tendon qui travaille, pas le muscle.',
  },
  {
    id: 'ab-wheel-rollout',
    nom: 'Ab wheel rollout',
    categorie: 'moyen',
    saisie: 'reps',
    principaux: ['abdos'],
    secondaires: ['obliques', 'dorsaux', 'deltoideAnterieur', 'lombaires'],
    conseils: [
      'Bassin en rétroversion (bas du dos arrondi, pas cambré) avant de partir.',
      'Avance aussi loin que tu peux garder le bas du dos neutre, puis reviens.',
      'Garde les bras quasi tendus : ce ne sont pas les épaules qui tirent la roue.',
      'Progresse en augmentant l’amplitude avant d’augmenter les répétitions.',
    ],
    erreur: 'Se cambrer en fin d’extension : la pression passe directement dans les lombaires.',
  },
  {
    id: 'echauffement',
    nom: 'Échauffement',
    categorie: 'isolation',
    saisie: 'temps',
    principaux: ['quadriceps', 'ischios', 'mollets'],
    secondaires: ['fessiers', 'abdos', 'deltoideLateral'],
    conseils: [
      '5 min de cardio progressif pour monter la température, puis 5 min de mobilité active.',
      'Montées de genoux, talons-fesses, pas chassés, rotations de hanches et de chevilles.',
      'Termine par 2-3 accélérations à 60-70 % avant les sprints réels.',
      'Si tu as froid aux ischios, c’est que l’échauffement est trop court.',
    ],
    erreur: 'Attaquer les sprints sur un échauffement bâclé : c’est la blessure d’ischio la plus classique.',
  },
  {
    id: 'sprints-60m',
    nom: 'Sprints 60 m',
    categorie: 'compose',
    saisie: 'temps',
    principaux: ['ischios', 'fessiers', 'quadriceps'],
    secondaires: ['mollets', 'abdos', 'lombaires', 'deltoideAnterieur'],
    conseils: [
      '8 sprints à 90 % : vite, mais sans crispation et sans chercher le record.',
      'Récupération quasi complète entre les sprints (2 à 3 min de marche) pour garder la vitesse.',
      'Buste droit, bras actifs, appuis sous le bassin, pas devant.',
      'Arrête la série dès que la vitesse chute nettement : la qualité fait le progrès, pas le volume.',
    ],
    erreur: 'Enchaîner les sprints avec trop peu de repos : la séance devient du cardio lent et le risque d’élongation grimpe.',
  },
  {
    id: 'tractions',
    nom: 'Tractions (max)',
    categorie: 'compose',
    saisie: 'reps',
    principaux: ['dorsaux', 'biceps'],
    secondaires: ['trapezes', 'deltoidePosterieur', 'avantBras', 'abdos'],
    conseils: [
      'Part bras tendus, épaules basses : descends les omoplates avant de tirer.',
      'Tire les coudes vers les côtes, menton au-dessus de la barre.',
      'Pas de balancier : le corps reste gainé, jambes légèrement en avant.',
      'Descente contrôlée jusqu’à l’extension complète à chaque répétition.',
    ],
    erreur: 'Faire des demi-tractions avec élan pour gonfler le compte : l’amplitude basse, celle qui construit le dos, est perdue.',
  },
  {
    id: 'dips',
    nom: 'Dips',
    categorie: 'compose',
    saisie: 'reps',
    principaux: ['pectoraux', 'triceps'],
    secondaires: ['deltoideAnterieur', 'abdos'],
    conseils: [
      'Buste légèrement penché en avant pour les pectoraux, plus vertical pour les triceps.',
      'Descends jusqu’à ce que les épaules arrivent au niveau des coudes, pas plus bas.',
      'Épaules basses, loin des oreilles, pendant tout le mouvement.',
      'Jambes gainées et serrées pour éviter le balancier.',
    ],
    erreur: 'Descendre trop bas avec les épaules qui roulent vers l’avant : l’articulation prend tout et la coiffe souffre.',
  },
  {
    id: 'pompes',
    nom: 'Pompes',
    categorie: 'moyen',
    saisie: 'reps',
    principaux: ['pectoraux', 'triceps'],
    secondaires: ['deltoideAnterieur', 'abdos', 'obliques'],
    conseils: [
      'Corps en planche : fessiers serrés, bassin dans l’alignement des épaules et des talons.',
      'Mains un peu plus large que les épaules, coudes à 45°, pas en T.',
      'Poitrine qui descend près du sol, puis poussée complète.',
      'Si c’est trop facile, ralentis la descente (3 s) avant de chercher plus de répétitions.',
    ],
    erreur: 'Laisser le bassin s’affaisser : les lombaires travaillent, les pectoraux beaucoup moins.',
  },
  {
    id: 'squats-sautes',
    nom: 'Squats sautés',
    categorie: 'moyen',
    saisie: 'reps',
    principaux: ['quadriceps', 'fessiers'],
    secondaires: ['mollets', 'ischios', 'abdos'],
    conseils: [
      'Descends en squat contrôlé, explose vers le haut, amortis en souplesse.',
      'Réception sur l’avant du pied puis talon, genoux fléchis : jamais jambes raides.',
      'Genoux dans l’axe, surtout quand la fatigue arrive.',
      'Arrête la série si les sauts deviennent mous : c’est de l’explosivité, pas du cardio.',
    ],
    erreur: 'Réceptionner jambes tendues et genoux rentrés vers l’intérieur : les genoux encaissent tout l’impact.',
  },
  {
    id: 'planche',
    nom: 'Planche',
    categorie: 'isolation',
    saisie: 'temps',
    principaux: ['abdos'],
    secondaires: ['obliques', 'lombaires', 'fessiers', 'deltoideAnterieur'],
    conseils: [
      'Coudes sous les épaules, avant-bras au sol, corps en ligne droite.',
      'Serre les abdos et les fessiers, bassin légèrement en rétroversion.',
      'Respire normalement : si tu bloques ta respiration, la position n’est pas tenue par les abdos.',
      'Arrête dès que le bassin tombe : 30 s propres valent mieux que 60 s avachies.',
    ],
    erreur: 'Monter les fesses ou creuser le dos pour tenir plus longtemps : le gainage ne travaille plus.',
  },
  {
    id: 'tirage-vertical',
    nom: 'Tirage vertical',
    categorie: 'moyen',
    saisie: 'charge',
    principaux: ['dorsaux'],
    secondaires: ['biceps', 'trapezes', 'deltoidePosterieur', 'avantBras'],
    conseils: [
      'Cuisses bien bloquées sous les cales, buste légèrement incliné vers l’arrière et figé.',
      'Descends les omoplates avant de plier les coudes.',
      'Barre au niveau du haut des pectoraux, coudes vers le bas et l’arrière.',
      'Remontée complète et contrôlée pour étirer les dorsaux.',
    ],
    erreur: 'Se balancer d’avant en arrière pour tirer plus lourd : le mouvement devient un rowing bâclé.',
  },
  {
    id: 'releves-jambes-suspendu',
    nom: 'Relevés de jambes suspendu',
    categorie: 'isolation',
    saisie: 'reps',
    principaux: ['abdos'],
    secondaires: ['obliques', 'avantBras', 'dorsaux'],
    conseils: [
      'Épaules actives (pas pendues), corps immobile avant de lancer la première répétition.',
      'Monte les jambes en enroulant le bassin vers le haut, pas seulement en pliant les hanches.',
      'Jambes tendues si tu peux, genoux pliés sinon : l’important est le contrôle.',
      'Descente freinée, sans laisser le corps partir en balancier.',
    ],
    erreur: 'Se balancer et s’arrêter à 90° : ce sont les fléchisseurs de hanche qui travaillent, les abdos presque pas.',
  },
  {
    id: 'marche-inclinee',
    nom: 'Marche inclinée',
    categorie: 'isolation',
    saisie: 'temps',
    principaux: ['fessiers', 'ischios'],
    secondaires: ['mollets', 'quadriceps', 'lombaires'],
    conseils: [
      'Inclinaison 10-12 %, vitesse 5-6 km/h, 25-30 min : tu dois pouvoir parler, mais pas chanter.',
      'Ne t’accroche pas aux poignées : le travail disparaît si tu te déleste.',
      'Buste droit, pas penché en avant sur le tapis.',
      'Optionnel les mardis et mercredis : c’est de la récupération active, pas une séance.',
    ],
    erreur: 'Monter la vitesse au point de courir : la dépense change peu et les articulations prennent les impacts.',
  },
]

export const EXERCICES_PAR_ID: Record<string, Exercice> = Object.fromEntries(
  EXERCICES.map((e) => [e.id, e]),
)

export function exercice(id: string): Exercice {
  const e = EXERCICES_PAR_ID[id]
  if (!e) throw new Error(`Exercice inconnu : ${id}`)
  return e
}
