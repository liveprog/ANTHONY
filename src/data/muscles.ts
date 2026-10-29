export type MuscleId =
  | 'pectoraux'
  | 'deltoideAnterieur'
  | 'deltoideLateral'
  | 'deltoidePosterieur'
  | 'biceps'
  | 'triceps'
  | 'avantBras'
  | 'abdos'
  | 'obliques'
  | 'trapezes'
  | 'dorsaux'
  | 'lombaires'
  | 'fessiers'
  | 'quadriceps'
  | 'ischios'
  | 'mollets'

export type MuscleView = 'face' | 'dos' | 'les-deux'

export const MUSCLES: Record<MuscleId, { label: string; court: string; vue: MuscleView }> = {
  pectoraux: { label: 'Pectoraux', court: 'Pecs', vue: 'face' },
  deltoideAnterieur: { label: 'Deltoïdes antérieurs', court: 'Delt. ant.', vue: 'face' },
  deltoideLateral: { label: 'Deltoïdes latéraux', court: 'Delt. lat.', vue: 'les-deux' },
  deltoidePosterieur: { label: 'Deltoïdes postérieurs', court: 'Delt. post.', vue: 'dos' },
  biceps: { label: 'Biceps', court: 'Biceps', vue: 'face' },
  triceps: { label: 'Triceps', court: 'Triceps', vue: 'dos' },
  avantBras: { label: 'Avant-bras', court: 'Avant-bras', vue: 'les-deux' },
  abdos: { label: 'Abdominaux', court: 'Abdos', vue: 'face' },
  obliques: { label: 'Obliques', court: 'Obliques', vue: 'face' },
  trapezes: { label: 'Trapèzes', court: 'Trapèzes', vue: 'les-deux' },
  dorsaux: { label: 'Dorsaux (grand dorsal)', court: 'Dorsaux', vue: 'dos' },
  lombaires: { label: 'Lombaires', court: 'Lombaires', vue: 'dos' },
  fessiers: { label: 'Fessiers', court: 'Fessiers', vue: 'dos' },
  quadriceps: { label: 'Quadriceps', court: 'Quadris', vue: 'face' },
  ischios: { label: 'Ischio-jambiers', court: 'Ischios', vue: 'dos' },
  mollets: { label: 'Mollets', court: 'Mollets', vue: 'les-deux' },
}

export const ORDRE_MUSCLES: MuscleId[] = [
  'pectoraux',
  'deltoideAnterieur',
  'deltoideLateral',
  'deltoidePosterieur',
  'trapezes',
  'dorsaux',
  'lombaires',
  'biceps',
  'triceps',
  'avantBras',
  'abdos',
  'obliques',
  'fessiers',
  'quadriceps',
  'ischios',
  'mollets',
]
