#!/usr/bin/env python3
"""Trouve les meilleurs moments d'une vidéo et exporte des clips verticaux 9:16.

Usage:
  python3 clipper.py SOURCE [--srt sous-titres.srt] [--clips 8] [--duration 45] [--out clips]
  SOURCE = chemin d'un fichier vidéo local OU une URL YouTube (téléchargée via yt-dlp).

Score = énergie audio (les moments où ça crie / ça réagit) + mots-clés dans les sous-titres.
"""
import argparse
import json
import os
import re
import subprocess
import sys

import numpy as np

HYPE_WORDS = [
    "oh", "non", "wtf", "putain", "merde", "incroyable", "dingue", "mort", "impossible",
    "jamais", "attends", "viens", "allez", "let's go", "gg", "clutch", "ez", "rage",
    "ça y est", "explose", "boom", "lol", "mdr", "haha",
]


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def download(url, outdir):
    """Télécharge la vidéo YouTube et renvoie le chemin du fichier mp4 obtenu."""
    os.makedirs(outdir, exist_ok=True)
    template = os.path.join(outdir, "source.%(ext)s")
    cmd = [
        "yt-dlp", "-f", "bv*[height<=1080]+ba/b[height<=1080]/b",
        "--merge-output-format", "mp4", "-o", template,
        "--print", "after_move:filepath", url,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f"Téléchargement échoué:\n{res.stderr[-1500:]}")
    return res.stdout.strip().splitlines()[-1]


def audio_energy(src, step=0.5):
    """Renvoie un tableau RMS (dB) par tranche de `step` secondes."""
    cmd = ["ffmpeg", "-v", "error", "-i", src, "-vn", "-ac", "1", "-ar", "16000",
           "-f", "s16le", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    hop = int(16000 * step)
    n = len(samples) // hop
    frames = samples[: n * hop].reshape(n, hop)
    rms = np.sqrt((frames ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(rms)


def parse_srt(path):
    """Renvoie une liste de (début, fin, texte) en secondes."""
    def t(s):
        h, m, rest = s.replace(",", ".").split(":")
        return int(h) * 3600 + int(m) * 60 + float(rest)

    blocks = re.split(r"\n\s*\n", open(path, encoding="utf-8", errors="ignore").read().strip())
    cues = []
    for b in blocks:
        lines = b.strip().splitlines()
        for i, line in enumerate(lines):
            if "-->" in line:
                start, end = [x.strip() for x in line.split("-->")[:2]]
                text = " ".join(lines[i + 1:]).strip()
                cues.append((t(start), t(end), text))
                break
    return cues


def keyword_density(cues, n, step=0.5):
    """Nombre de mots-clés par tranche de `step` secondes, sur `n` tranches."""
    dens = np.zeros(n)
    for start, _, text in cues:
        hits = sum(text.lower().count(w) for w in HYPE_WORDS)
        if hits:
            idx = int(start / step)
            if idx < n:
                dens[idx] += hits
    return dens


def pick_windows(score, step, clip_len, n_clips, min_gap):
    """Choisit les meilleurs fenêtres glissantes sans chevauchement."""
    win = int(clip_len / step)
    if len(score) < win:
        return []
    window_scores = np.convolve(score, np.ones(win) / win, mode="valid")
    order = np.argsort(-window_scores)
    chosen = []
    for idx in order:
        start = idx * step
        if all(abs(start - c["start"]) >= min_gap for c in chosen):
            chosen.append({"start": float(start), "score": float(window_scores[idx])})
        if len(chosen) == n_clips:
            break
    return sorted(chosen, key=lambda c: c["start"])


def write_clip_srt(cues, start, end, path):
    """Écrit un SRT recalé sur le début du clip, pour incrustation."""
    def fmt(sec):
        h, rem = divmod(sec, 3600)
        m, s = divmod(rem, 60)
        return f"{int(h):02d}:{int(m):02d}:{s:06.3f}".replace(".", ",")

    out, idx = [], 1
    for s, e, text in cues:
        if e < start or s > end:
            continue
        s2, e2 = max(s, start) - start, min(e, end) - start
        out.append(f"{idx}\n{fmt(s2)} --> {fmt(e2)}\n{text}\n")
        idx += 1
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    return idx > 1


def render_clip(src, start, duration, out_path, srt_path=None):
    """Recadrage 9:16 (fond flou + vidéo centrée) et incrustation des sous-titres."""
    fg = "[0:v]split[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase," \
         "crop=1080:1920,boxblur=20:5[bgb];[fg]scale=1080:-2[fgs];" \
         "[bgb][fgs]overlay=(W-w)/2:(H-h)/2"
    if srt_path:
        esc = srt_path.replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
        fg += f",subtitles='{esc}':force_style='Fontsize=14,Alignment=2,MarginV=260'"
    cmd = ["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.2f}", "-t", f"{duration:.2f}",
           "-i", src, "-filter_complex", fg,
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
           "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", out_path]
    subprocess.run(cmd, check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", help="fichier vidéo local ou URL YouTube")
    ap.add_argument("--srt", help="sous-titres (.srt) pour le scoring et l'incrustation")
    ap.add_argument("--clips", type=int, default=8, help="nombre de clips à extraire")
    ap.add_argument("--duration", type=float, default=45, help="durée d'un clip en secondes")
    ap.add_argument("--min-gap", type=float, default=60, help="écart minimum entre deux clips (s)")
    ap.add_argument("--out", default="clips", help="dossier de sortie")
    ap.add_argument("--no-subs", action="store_true", help="ne pas incruster les sous-titres")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    src = download(args.source, os.path.join(args.out, "_work")) if args.source.startswith("http") else args.source
    if not os.path.isfile(src):
        sys.exit(f"Fichier introuvable: {src}")

    step = 0.5
    energy = audio_energy(src, step)
    z = (energy - energy.mean()) / (energy.std() + 1e-9)
    score = np.clip(z, 0, None)  # on ne garde que ce qui dépasse la moyenne

    cues = parse_srt(args.srt) if args.srt else []
    if cues:
        dens = keyword_density(cues, len(energy), step)
        score = score + 1.5 * dens / (dens.max() + 1e-9)

    windows = pick_windows(score, step, args.duration, args.clips, args.min_gap)
    if not windows:
        sys.exit("Vidéo trop courte pour la durée demandée.")

    manifest = []
    for i, w in enumerate(windows, 1):
        name = f"clip_{i:02d}.mp4"
        out_path = os.path.join(args.out, name)
        srt_path = None
        if cues and not args.no_subs:
            srt_path = os.path.join(args.out, f"_work", f"clip_{i:02d}.srt")
            os.makedirs(os.path.dirname(srt_path), exist_ok=True)
            if not write_clip_srt(cues, w["start"], w["start"] + args.duration, srt_path):
                srt_path = None
        render_clip(src, w["start"], args.duration, out_path, srt_path)
        manifest.append({"file": out_path, "start": round(w["start"], 1),
                         "end": round(w["start"] + args.duration, 1),
                         "score": round(w["score"], 3)})
        print(f"[{i}/{len(windows)}] {out_path}  ({w['start']:.0f}s → {w['start'] + args.duration:.0f}s)")

    with open(os.path.join(args.out, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"Terminé: {len(manifest)} clips dans {args.out}/manifest.json")


if __name__ == "__main__":
    main()
