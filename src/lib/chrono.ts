import { useSyncExternalStore } from 'react'
import { storeReglages } from './donnees'

export type EtatChrono = {
  exerciceId: string | null
  libelle: string
  total: number
  /** Horodatage de fin, ou null si en pause / arrêté. */
  finAt: number | null
  restantEnPause: number
  actif: boolean
}

const INITIAL: EtatChrono = {
  exerciceId: null,
  libelle: '',
  total: 0,
  finAt: null,
  restantEnPause: 0,
  actif: false,
}

let etat: EtatChrono = INITIAL
const abonnes = new Set<() => void>()
let audio: AudioContext | null = null
let timeoutFin: number | null = null

function notifier() {
  abonnes.forEach((fn) => fn())
}

function majEtat(suivant: EtatChrono) {
  etat = suivant
  notifier()
}

export function useChrono(): EtatChrono {
  return useSyncExternalStore(
    (fn) => {
      abonnes.add(fn)
      return () => abonnes.delete(fn)
    },
    () => etat,
    () => etat,
  )
}

export function restantChrono(e: EtatChrono = etat): number {
  if (!e.actif) return 0
  if (e.finAt === null) return e.restantEnPause
  return Math.max(0, (e.finAt - Date.now()) / 1000)
}

function preparerAudio() {
  try {
    type FenetreAudio = Window & { webkitAudioContext?: typeof AudioContext }
    const Ctor = window.AudioContext ?? (window as FenetreAudio).webkitAudioContext
    if (!Ctor) return
    if (!audio) audio = new Ctor()
    if (audio.state === 'suspended') void audio.resume()
  } catch {
    audio = null
  }
}

/** Trois bips courts en fin de repos. */
export function bip() {
  const reglages = storeReglages.get()
  if (reglages.vibrationRepos !== false && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([180, 90, 180, 90, 260])
    } catch {
      /* vibration refusée par le navigateur */
    }
  }
  if (reglages.sonRepos === false) return
  preparerAudio()
  if (!audio) return
  const ctx = audio
  const debut = ctx.currentTime
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = i === 2 ? 1180 : 880
    const t = debut + i * 0.22
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.28, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.2)
  }
}

function programmerFin(secondes: number) {
  if (timeoutFin !== null) window.clearTimeout(timeoutFin)
  timeoutFin = window.setTimeout(() => {
    timeoutFin = null
    bip()
    notifier()
  }, Math.max(0, secondes * 1000))
}

export function lancerChrono(secondes: number, exerciceId: string, libelle: string) {
  preparerAudio()
  majEtat({
    exerciceId,
    libelle,
    total: secondes,
    finAt: Date.now() + secondes * 1000,
    restantEnPause: secondes,
    actif: true,
  })
  programmerFin(secondes)
}

export function basculerPause() {
  if (!etat.actif) return
  if (etat.finAt === null) {
    majEtat({ ...etat, finAt: Date.now() + etat.restantEnPause * 1000 })
    programmerFin(etat.restantEnPause)
  } else {
    const restant = restantChrono()
    if (timeoutFin !== null) {
      window.clearTimeout(timeoutFin)
      timeoutFin = null
    }
    majEtat({ ...etat, finAt: null, restantEnPause: restant })
  }
}

export function ajouterTemps(secondes: number) {
  if (!etat.actif) return
  if (etat.finAt === null) {
    majEtat({
      ...etat,
      total: etat.total + secondes,
      restantEnPause: Math.max(0, etat.restantEnPause + secondes),
    })
    return
  }
  const restant = Math.max(0, restantChrono() + secondes)
  majEtat({ ...etat, total: etat.total + secondes, finAt: Date.now() + restant * 1000 })
  programmerFin(restant)
}

export function arreterChrono() {
  if (timeoutFin !== null) {
    window.clearTimeout(timeoutFin)
    timeoutFin = null
  }
  majEtat(INITIAL)
}
