import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import Maquette from './components/Maquette'
import { demarrerSauvegarde } from './lib/sync'
import ChronoRepos from './components/ChronoRepos'
import Programme from './screens/Programme'
import JourDetail from './screens/JourDetail'
import FicheExercice from './screens/FicheExercice'
import Seance from './screens/Seance'
import Calories from './screens/Calories'
// Les graphiques (recharts) ne sont chargés qu'à l'ouverture de l'onglet Progrès.
const Progres = lazy(() => import('./screens/Progres'))
import Reglages from './screens/Reglages'

export type Onglet = 'programme' | 'seance' | 'calories' | 'progres'

export type Page =
  | { type: 'jour'; id: string }
  | { type: 'exercice'; id: string; jourId?: string }
  | { type: 'reglages' }

export type Navigation = {
  onglet: Onglet
  allerA: (onglet: Onglet) => void
  ouvrir: (page: Page) => void
  fermer: () => void
  demarrerJour: (jourId: string) => void
}

const ONGLETS: { id: Onglet; libelle: string; icone: (actif: boolean) => JSX.Element }[] = [
  {
    id: 'programme',
    libelle: 'Programme',
    icone: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.4 : 1.9}>
        <rect x="3" y="4.5" width="18" height="16" rx="3" />
        <path d="M8 3v3M16 3v3M3 10h18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'seance',
    libelle: 'Séance',
    icone: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.4 : 1.9}>
        <path d="M6.5 8v8M17.5 8v8M3.5 10v4M20.5 10v4M6.5 12h11" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'calories',
    libelle: 'Calories',
    icone: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.4 : 1.9}>
        <path
          d="M12 3.5c1.8 3 .6 4.6-.5 6-1 1.3-2.4 2.5-2.4 4.6A4.9 4.9 0 0 0 14 19c2.6 0 4.6-2.1 4.6-4.9 0-4.4-4.2-6.3-6.6-10.6Z"
          strokeLinecap="round"
        />
        <path d="M8.2 11.5C6.4 13 5.4 14.6 5.4 16.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'progres',
    libelle: 'Progrès',
    icone: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.4 : 1.9}>
        <path d="M4 19V5M4 19h16" strokeLinecap="round" />
        <path d="M7.5 15.5 11 11l3 2.5 4-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function App() {
  useEffect(() => {
    void demarrerSauvegarde()
  }, [])

  const [onglet, setOnglet] = useState<Onglet>('programme')
  // Pile de pages : ouvrir empile, le bouton retour dépile.
  const [pile, setPile] = useState<Page[]>([])
  const [jourChoisi, setJourChoisi] = useState<string | null>(null)
  const page = pile.length > 0 ? pile[pile.length - 1] : null

  const allerA = useCallback((o: Onglet) => {
    setPile([])
    setOnglet(o)
  }, [])

  const nav: Navigation = useMemo(
    () => ({
      onglet,
      allerA,
      ouvrir: (p) => setPile((precedent) => [...precedent, p]),
      fermer: () => setPile((precedent) => precedent.slice(0, -1)),
      demarrerJour: (jourId) => {
        setJourChoisi(jourId)
        setPile([])
        setOnglet('seance')
      },
    }),
    [onglet, allerA],
  )

  return (
    <Maquette>
      <div className="flex-1 min-h-0 flex flex-col relative">
        <main className="flex-1 min-h-0 overflow-y-auto sans-scrollbar overscroll-contain">
          {page === null && onglet === 'programme' && <Programme nav={nav} />}
          {page === null && onglet === 'seance' && (
            <Seance nav={nav} jourChoisi={jourChoisi} setJourChoisi={setJourChoisi} />
          )}
          {page === null && onglet === 'calories' && <Calories />}
          {page === null && onglet === 'progres' && (
            <Suspense
              fallback={<p className="px-4 py-10 text-center text-sm text-white/35">Chargement des courbes…</p>}
            >
              <Progres nav={nav} />
            </Suspense>
          )}

          {page?.type === 'jour' && <JourDetail jourId={page.id} nav={nav} />}
          {page?.type === 'exercice' && (
            <FicheExercice exerciceId={page.id} jourId={page.jourId} nav={nav} />
          )}
          {page?.type === 'reglages' && <Reglages nav={nav} />}
        </main>

        <ChronoRepos />

        <nav className="shrink-0 border-t border-white/5 bg-ink-900/95 backdrop-blur-xl px-1.5 pt-1.5 pb-1.5">
          <ul className="flex items-stretch">
            {ONGLETS.map((o) => {
              const actif = onglet === o.id && page === null
              return (
                <li key={o.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => allerA(o.id)}
                    aria-current={actif ? 'page' : undefined}
                    className={`w-full min-h-[54px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${
                      actif ? 'text-lime-500' : 'text-white/40 active:text-white/70'
                    }`}
                  >
                    {o.icone(actif)}
                    <span className={`text-[10.5px] ${actif ? 'font-bold' : 'font-semibold'}`}>{o.libelle}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </Maquette>
  )
}
