/**
 * Étapes d'exécution, dans l'ordre des phases de l'animation :
 * l'étape en cours est surlignée pendant que le mannequin la joue.
 */
export const ETAPES: Record<string, string[]> = {
  'developpe-couche-barre': [
    'Allongé, omoplates serrées, pieds au sol : décale la barre et stabilise-la bras tendus au-dessus des pectoraux.',
    'Inspire et descends la barre en 2 s vers le bas des pectoraux, coudes à 45-60° du buste.',
    'Pousse en expirant jusqu’à l’extension complète, sans décoller les fessiers du banc.',
  ],
  'chest-press-incline-machine': [
    'Siège réglé pour avoir les poignées au niveau du haut des pectoraux, dos et omoplates collés au dossier.',
    'Pousse jusqu’à l’extension, en gardant une petite flexion des coudes à la fin.',
    'Reviens en 3 s jusqu’à sentir l’étirement du haut des pectoraux, sans laisser la charge claquer.',
  ],
  'rowing-haltere-un-bras': [
    'Main et genou en appui sur le banc, dos à plat, buste parallèle au sol, bras tendu vers le bas.',
    'Tire le coude vers la hanche en laissant l’omoplate reculer, sans tourner le buste.',
    'Redescends lentement jusqu’à l’extension complète pour étirer le dorsal.',
  ],
  'developpe-militaire-halteres': [
    'Debout, abdos et fessiers serrés, haltères au niveau des oreilles, coudes légèrement en avant.',
    'Pousse à la verticale jusqu’à verrouiller les coudes, poignets au-dessus des épaules.',
    'Redescends jusqu’à ce que les coudes passent sous les épaules, sans cambrer le bas du dos.',
  ],
  'elevations-laterales': [
    'Debout, buste très légèrement penché en avant, coudes à peine fléchis et figés.',
    'Monte les coudes jusqu’à l’horizontale, sans hausser les épaules.',
    'Redescends en 2-3 s en gardant la tension sur le deltoïde.',
  ],
  'curl-biceps-barre': [
    'Debout, coudes collés au buste, bras déroulés, poignets solides.',
    'Fléchis en gardant les coudes immobiles et serre le biceps une demi-seconde en haut.',
    'Déroule complètement les bras en contrôlant la descente, sans coup de reins.',
  ],
  'crunch-poulie-haute': [
    'À genoux sous la poulie, corde de chaque côté du visage, hanches fixes.',
    'Enroule la colonne vertèbre par vertèbre en rapprochant les côtes du bassin, expire à fond.',
    'Remonte lentement en gardant la tension, sans laisser la charge te redresser.',
  ],
  'squat-ou-presse': [
    'Barre installée, grande inspiration, ventre gainé, pieds à largeur d’épaules.',
    'Descends jusqu’à la cuisse parallèle au sol, genoux dans l’axe des pieds, dos neutre.',
    'Remonte en poussant dans tout le pied et expire en passant le point difficile.',
  ],
  'souleve-de-terre-roumain': [
    'Debout, barre collée aux cuisses, genoux à peine fléchis et figés, dos plat.',
    'Envoie les hanches vers l’arrière, barre qui glisse le long des jambes, jusqu’à l’étirement des ischios.',
    'Remonte en poussant le bassin vers l’avant et serre les fessiers en haut.',
  ],
  'fentes-marchees': [
    'Haltères le long du corps, buste droit, fais un grand pas en avant.',
    'Descends le genou arrière près du sol, genou avant au-dessus du pied.',
    'Pousse sur le talon avant pour te relever et enchaîne le pas suivant.',
  ],
  'leg-curl': [
    'Allongé, axe de la machine aligné avec les genoux, bassin collé au siège.',
    'Fléchis les genoux jusqu’en haut et serre les ischios une demi-seconde.',
    'Redescends lentement, sans laisser la charge taper la butée.',
  ],
  'mollets-debout': [
    'Avant-pieds sur la marche, talons bas : cherche l’étirement complet.',
    'Monte sur la pointe des pieds, genoux tendus, en poussant sur l’avant du pied.',
    'Marque une seconde en haut avant de redescendre, sans rebondir.',
  ],
  'ab-wheel-rollout': [
    'À genoux, bassin en rétroversion, bas du dos arrondi, bras quasi tendus.',
    'Déroule vers l’avant aussi loin que le bas du dos reste neutre.',
    'Reviens en tirant avec les abdos, sans cambrer en fin d’extension.',
  ],
  echauffement: [
    'Monte un genou à hauteur de hanche, bras actifs, buste droit.',
    'Repose le pied sous le bassin, appui dynamique, sans t’écraser.',
    'Alterne avec l’autre genou ; termine par 2-3 accélérations à 60-70 %.',
  ],
  'sprints-60m': [
    'Appui sous le bassin : pousse le sol vers l’arrière, hanche haute.',
    'Phase de suspension : genou libre qui remonte, cheville armée.',
    'Griffe le sol avec l’avant du pied, bras actifs dans l’axe.',
  ],
  tractions: [
    'Suspension bras tendus, épaules basses : descends les omoplates avant de tirer.',
    'Tire les coudes vers les côtes jusqu’à passer le menton au-dessus de la barre.',
    'Redescends en contrôlant jusqu’à l’extension complète, sans balancier.',
  ],
  dips: [
    'Bras tendus sur les barres, épaules basses, jambes gainées, buste penché en avant.',
    'Descends jusqu’à ce que les épaules arrivent au niveau des coudes, pas plus bas.',
    'Pousse jusqu’à l’extension sans laisser les épaules rouler vers l’avant.',
  ],
  pompes: [
    'Corps en planche : mains un peu plus larges que les épaules, fessiers serrés.',
    'Descends la poitrine près du sol, coudes à 45°, bassin dans l’alignement.',
    'Pousse jusqu’à l’extension complète sans creuser le bas du dos.',
  ],
  'squats-sautes': [
    'Descends en squat contrôlé, genoux dans l’axe, poitrine haute.',
    'Explose vers le haut en poussant dans tout le pied.',
    'Réceptionne sur l’avant du pied puis le talon, genoux fléchis pour amortir.',
  ],
  planche: [
    'Coudes sous les épaules, avant-bras au sol, corps en ligne droite.',
    'Serre les abdos et les fessiers, respire normalement, et arrête dès que le bassin tombe.',
  ],
  'tirage-vertical': [
    'Cuisses bloquées sous les cales, buste légèrement incliné vers l’arrière et figé.',
    'Descends les omoplates puis amène la barre au niveau du haut des pectoraux.',
    'Remonte en contrôlant jusqu’à l’extension complète pour étirer les dorsaux.',
  ],
  'releves-jambes-suspendu': [
    'Suspendu, épaules actives, corps immobile avant la première répétition.',
    'Monte les jambes en enroulant le bassin, pas seulement en pliant les hanches.',
    'Redescends en freinant, sans partir en balancier.',
  ],
  'marche-inclinee': [
    'Inclinaison 10-12 %, vitesse 5-6 km/h : buste droit, sans t’accrocher aux poignées.',
    'Déroule le pas complètement, du talon à la pointe.',
    'Garde une allure où tu peux parler mais pas chanter, 25-30 min.',
  ],
  'extensions-triceps': [
    'Debout face à la poulie, buste légèrement penché, coudes collés au buste et immobiles.',
    'Déroule les avant-bras jusqu’à l’extension complète et serre les triceps une demi-seconde.',
    'Remonte en contrôlant jusqu’à ce que les avant-bras touchent les biceps.',
  ],
  'tirage-horizontal': [
    'Assis, buste droit et figé, genoux à peine fléchis, bras tendus : laisse les dorsaux s’étirer.',
    'Tire les coudes le long des côtes jusqu’au nombril et serre les omoplates.',
    'Reviens lentement jusqu’à l’extension complète sans arrondir le dos.',
  ],
  'face-pull': [
    'Poulie à hauteur du visage, corde en prise neutre, bras tendus, épaules basses.',
    'Tire vers le front en écartant les mains, coudes au-dessus des poignets, et serre une seconde.',
    'Reviens en contrôlant, sans laisser les épaules partir vers l’avant.',
  ],
  'curl-marteau': [
    'Debout, haltères en prise neutre, paumes face à face, coudes collés au buste.',
    'Monte sans balancier et serre une demi-seconde en haut.',
    'Déroule complètement les bras en freinant la descente.',
  ],
}
