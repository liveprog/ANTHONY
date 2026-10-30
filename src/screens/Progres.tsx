import { useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Navigation } from '../App'
import { EnteteOnglet } from '../components/Entete'
import { Bouton, Carte, Etiquette, Stat, Titre, Vide } from '../components/Ui'
import { EXERCICES, exercice } from '../data/exercices'
import {
  exporterDonnees,
  historiqueExercice,
  importerDonnees,
  records,
  useSeances,
  volumeSeance,
} from '../lib/donnees'
import { formaterDateCourte, nombre } from '../lib/format'
import BandeauSauvegarde, { useEtatSauvegarde } from '../components/EtatSauvegarde'

const COULEUR = '#c6f948'

export default function Progres({ nav }: { nav: Navigation }) {
  const seances = useSeances()
  const sauvegarde = useEtatSauvegarde()
  const terminees = useMemo(() => seances.filter((s) => s.terminee), [seances])
  const prs = useMemo(() => records(terminees), [terminees])

  const avecHistorique = useMemo(
    () => EXERCICES.filter((e) => historiqueExercice(e.id, terminees).length > 0),
    [terminees],
  )
  const [exoId, setExoId] = useState<string>(() => avecHistorique[0]?.id ?? 'developpe-couche-barre')
  const exoActif = avecHistorique.find((e) => e.id === exoId) ?? avecHistorique[0] ?? null

  const serie = useMemo(() => {
    if (!exoActif) return []
    return historiqueExercice(exoActif.id, terminees)
      .slice()
      .reverse()
      .map((h) => ({
        date: formaterDateCourte(h.date),
        poids: Math.round(h.poidsMax * 10) / 10,
        volume: Math.round(h.volume),
        reps: h.repsMax,
        secondes: h.secondesMax,
      }))
  }, [exoActif, terminees])

  const volumeTotal = useMemo(() => terminees.reduce((t, s) => t + volumeSeance(s), 0), [terminees])
  const champImport = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ton: 'ok' | 'ko'; texte: string } | null>(null)

  function exporter() {
    const donnees = exporterDonnees()
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = `antho-fit-${donnees.exporteLe.slice(0, 10)}.json`
    lien.click()
    URL.revokeObjectURL(url)
    setMessage({ ton: 'ok', texte: 'Export généré : garde ce fichier pour retrouver tes données.' })
  }

  async function importer(fichier: File) {
    const texte = await fichier.text()
    const res = importerDonnees(texte)
    if (res.ok) {
      setMessage({
        ton: 'ok',
        texte: `Import réussi : ${res.seances} séance(s) et ${res.repas} repas chargés.`,
      })
    } else {
      setMessage({ ton: 'ko', texte: res.erreur })
    }
    if (champImport.current) champImport.current.value = ''
  }

  const typeSaisie = exoActif ? exercice(exoActif.id).saisie : 'charge'

  return (
    <div className="pb-6">
      <EnteteOnglet
        titre="Progrès"
        sous={`${terminees.length} séance${terminees.length > 1 ? 's' : ''} enregistrée${
          terminees.length > 1 ? 's' : ''
        }`}
      />

      <div className="px-4 space-y-5">
        <BandeauSauvegarde />

        <div className="grid grid-cols-3 gap-2">
          <Stat valeur={terminees.length} libelle="Séances" />
          <Stat
            valeur={volumeTotal >= 1000 ? nombre(Math.round(volumeTotal / 1000), 1) : nombre(Math.round(volumeTotal))}
            unite={volumeTotal >= 1000 ? 't' : 'kg'}
            libelle="Volume cumulé"
          />
          <Stat valeur={prs.length} libelle="Exercices suivis" />
        </div>

        {avecHistorique.length === 0 ? (
          <Vide
            titre="Pas encore de données"
            texte="Termine une séance dans l’onglet Séance : les courbes et les records apparaîtront ici."
          />
        ) : (
          <>
            <section>
              <Titre>Courbes par exercice</Titre>
              <div className="-mx-4 px-4 overflow-x-auto sans-scrollbar mb-3">
                <div className="flex gap-1.5 w-max pb-1">
                  {avecHistorique.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setExoId(e.id)}
                      className={`px-3 min-h-[40px] rounded-xl text-[12px] font-bold border whitespace-nowrap ${
                        e.id === exoActif?.id
                          ? 'bg-lime-500 text-ink-950 border-lime-500'
                          : 'bg-ink-850 text-white/55 border-white/5'
                      }`}
                    >
                      {e.nom}
                    </button>
                  ))}
                </div>
              </div>

              <Carte className="p-3 pt-4">
                <p className="text-[12px] font-bold text-white/50 px-1 mb-1">
                  {typeSaisie === 'charge'
                    ? 'Charge max (kg)'
                    : typeSaisie === 'temps'
                      ? 'Durée max (s)'
                      : 'Répétitions max'}
                </p>
                <div className="h-[170px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={serie} margin={{ top: 6, right: 10, bottom: 0, left: -4 }}>
                      <CartesianGrid stroke="#232a32" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7682', fontSize: 10 }}
                        stroke="#232a32"
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fill: '#6b7682', fontSize: 10 }} stroke="#232a32" width={38} />
                      <Tooltip
                        contentStyle={{
                          background: '#13171c',
                          border: '1px solid #2e3741',
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: '#9aa6b2' }}
                      />
                      <Line
                        type="monotone"
                        dataKey={typeSaisie === 'charge' ? 'poids' : typeSaisie === 'temps' ? 'secondes' : 'reps'}
                        name={typeSaisie === 'charge' ? 'kg' : typeSaisie === 'temps' ? 's' : 'reps'}
                        stroke={COULEUR}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: COULEUR }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Carte>

              {typeSaisie === 'charge' && (
                <Carte className="p-3 pt-4 mt-2">
                  <p className="text-[12px] font-bold text-white/50 px-1 mb-1">
                    Volume par séance (kg × reps)
                  </p>
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={serie} margin={{ top: 6, right: 10, bottom: 0, left: -4 }}>
                        <defs>
                          <linearGradient id="grad-volume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COULEUR} stopOpacity={0.45} />
                            <stop offset="100%" stopColor={COULEUR} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#232a32" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: '#6b7682', fontSize: 10 }}
                          stroke="#232a32"
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fill: '#6b7682', fontSize: 10 }} stroke="#232a32" width={38} />
                        <Tooltip
                          contentStyle={{
                            background: '#13171c',
                            border: '1px solid #2e3741',
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                          labelStyle={{ color: '#9aa6b2' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          name="kg"
                          stroke={COULEUR}
                          strokeWidth={2}
                          fill="url(#grad-volume)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Carte>
              )}
            </section>

            <section>
              <Titre>Records personnels</Titre>
              <ul className="space-y-2">
                {prs
                  .slice()
                  .sort((a, b) => b.poidsMax - a.poidsMax)
                  .map((pr) => {
                    const ex = exercice(pr.exerciceId)
                    return (
                      <li key={pr.exerciceId}>
                        <Carte
                          onClick={() => nav.ouvrir({ type: 'exercice', id: pr.exerciceId })}
                          className="p-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-[14px] truncate">{ex.nom}</p>
                            <p className="text-[11.5px] text-white/35 first-letter:uppercase">
                              {formaterDateCourte(pr.date)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            {ex.saisie === 'charge' && (
                              <>
                                <p className="font-extrabold text-lime-400">
                                  {nombre(pr.poidsMax, pr.poidsMax % 1 ? 1 : 0)}
                                  <span className="text-[11px] ml-0.5">kg</span>
                                </p>
                                <p className="text-[11px] text-white/35">
                                  volume {nombre(Math.round(pr.volumeMax))} kg
                                </p>
                              </>
                            )}
                            {ex.saisie === 'reps' && (
                              <p className="font-extrabold text-lime-400">
                                {pr.repsMax}
                                <span className="text-[11px] ml-0.5">reps</span>
                              </p>
                            )}
                            {ex.saisie === 'temps' && (
                              <p className="font-extrabold text-lime-400">
                                {pr.secondesMax}
                                <span className="text-[11px] ml-0.5">s</span>
                              </p>
                            )}
                          </div>
                        </Carte>
                      </li>
                    )
                  })}
              </ul>
            </section>
          </>
        )}

        <section>
          <Titre>Sauvegarde</Titre>
          <Carte className="p-4 space-y-3">
            <p className="text-[12.5px] text-white/50 leading-relaxed">
              {sauvegarde.mode === 'cloud'
                ? 'Tes données sont enregistrées en ligne sur ton compte. L’export JSON reste la copie que tu gardes chez toi.'
                : 'Tes données vivent dans ce navigateur. Exporte-les avant de changer de téléphone, de vider le cache ou de passer en navigation privée.'}
            </p>
            <div className="flex gap-2">
              <Bouton variante="secondaire" className="flex-1" onClick={exporter}>
                Exporter en JSON
              </Bouton>
              <input
                ref={champImport}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void importer(f)
                }}
              />
              <Bouton variante="fantome" className="flex-1" onClick={() => champImport.current?.click()}>
                Importer
              </Bouton>
            </div>
            {message && (
              <div className="pt-1">
                <Etiquette ton={message.ton === 'ok' ? 'lime' : 'alerte'}>{message.texte}</Etiquette>
              </div>
            )}
            <p className="text-[11.5px] text-white/30">
              L’import remplace les séances et les repas actuels par ceux du fichier.
            </p>
          </Carte>
        </section>
      </div>
    </div>
  )
}
