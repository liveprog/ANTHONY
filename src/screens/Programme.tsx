import type { Navigation } from '../App'
import { REGLES, SEMAINE, jourDuJour, toutesLesPrescriptions } from '../data/programme'
import { exercice } from '../data/exercices'
import { EnteteOnglet } from '../components/Entete'
import { Bouton, Carte, Etiquette, Titre } from '../components/Ui'
import { useRepos, useSeances } from '../lib/donnees'

const ETIQUETTE_TYPE = {
  seance: { texte: 'Séance', ton: 'lime' as const },
  repos: { texte: 'Repos', ton: 'sombre' as const },
  libre: { texte: 'Libre', ton: 'neutre' as const },
}

export default function Programme({ nav }: { nav: Navigation }) {
  const aujourdhui = jourDuJour()
  const repos = useRepos()
  const seances = useSeances()
  const faites = seances.filter((s) => s.terminee).length
  const persos = Object.keys(repos).length

  return (
    <div className="pb-6">
      <EnteteOnglet
        titre="Antho Fit"
        sous={`${aujourdhui.jour} · ${aujourdhui.titre}`}
        action={
          <button
            type="button"
            onClick={() => nav.ouvrir({ type: 'reglages' })}
            aria-label="Réglages"
            className="w-10 h-10 rounded-xl bg-ink-800 grid place-items-center active:bg-ink-700"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1" strokeLinecap="round" />
            </svg>
          </button>
        }
      />

      <section className="px-4">
        <Carte className="p-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-lime-500/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 flex-wrap">
              <Etiquette ton="lime">Aujourd’hui</Etiquette>
              <Etiquette ton={ETIQUETTE_TYPE[aujourdhui.type].ton}>
                {ETIQUETTE_TYPE[aujourdhui.type].texte}
              </Etiquette>
              {aujourdhui.duree && <Etiquette>{aujourdhui.duree}</Etiquette>}
            </div>
            <h2 className="text-[22px] font-extrabold mt-2 leading-tight">{aujourdhui.titre}</h2>
            <p className="text-[13px] text-white/45 mt-1">
              {aujourdhui.type === 'repos'
                ? 'Rien à faire, et c’est voulu.'
                : `${toutesLesPrescriptions(aujourdhui).length} exercice${
                    toutesLesPrescriptions(aujourdhui).length > 1 ? 's' : ''
                  } · ${aujourdhui.resume}`}
            </p>
            <div className="flex gap-2 mt-4">
              {aujourdhui.type !== 'repos' && (
                <Bouton className="flex-1" onClick={() => nav.demarrerJour(aujourdhui.id)}>
                  Démarrer la séance
                </Bouton>
              )}
              <Bouton
                variante={aujourdhui.type === 'repos' ? 'secondaire' : 'fantome'}
                className={aujourdhui.type === 'repos' ? 'flex-1' : ''}
                onClick={() => nav.ouvrir({ type: 'jour', id: aujourdhui.id })}
              >
                Voir le détail
              </Bouton>
            </div>
          </div>
        </Carte>
      </section>

      <section className="px-4 mt-6">
        <Titre
          action={
            <span className="text-[12px] text-white/35">
              {faites} séance{faites > 1 ? 's' : ''} enregistrée{faites > 1 ? 's' : ''}
            </span>
          }
        >
          La semaine
        </Titre>
        <ul className="space-y-2">
          {SEMAINE.map((jour) => {
            const exos = toutesLesPrescriptions(jour)
            const estAujourdhui = jour.id === aujourdhui.id
            return (
              <li key={jour.id}>
                <Carte
                  onClick={() => nav.ouvrir({ type: 'jour', id: jour.id })}
                  className={`p-3.5 ${estAujourdhui ? 'ring-1 ring-lime-500/40' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 shrink-0 rounded-xl grid place-items-center text-[11px] font-extrabold uppercase ${
                        jour.type === 'seance'
                          ? 'bg-lime-500/15 text-lime-400'
                          : 'bg-ink-800 text-white/35'
                      }`}
                    >
                      {jour.jour.slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold truncate">{jour.titre}</h3>
                        {estAujourdhui && <Etiquette ton="lime">Auj.</Etiquette>}
                      </div>
                      <p className="text-[12.5px] text-white/40 truncate">
                        {exos.length > 0
                          ? exos
                              .slice(0, 3)
                              .map((p) => exercice(p.exerciceId).nom)
                              .join(' · ')
                          : 'Récupération, pas de séance'}
                      </p>
                    </div>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/25 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.5 5 16 12l-6.5 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Carte>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="px-4 mt-6">
        <Titre
          action={
            persos > 0 ? (
              <span className="text-[12px] text-white/35">
                {persos} repos personnalisé{persos > 1 ? 's' : ''}
              </span>
            ) : undefined
          }
        >
          Les règles
        </Titre>
        <div className="space-y-2">
          {REGLES.map((regle) => (
            <Carte key={regle.titre} className="p-3.5">
              <p className="text-[13px] leading-relaxed text-white/70">
                <span className="font-bold text-lime-400">{regle.titre}.</span> {regle.texte}
              </p>
            </Carte>
          ))}
        </div>
        <p className="text-[12px] text-white/35 mt-2 leading-snug">
          Les temps de repos viennent du programme, séance par séance. Tu les modifies par pas de
          15 s dans le détail d’un jour ou sur la fiche d’un exercice.
        </p>
      </section>
    </div>
  )
}
