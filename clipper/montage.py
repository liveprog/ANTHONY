#!/usr/bin/env python3
"""Assemble plusieurs parties vidéo, choisit les meilleurs passages et sort un montage 9:16 avec fondus.

Usage:
  python3 montage.py partie_00.mp4 partie_01.mp4 ... --duration 39 --clips 6 --out sortie/
"""
import argparse
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from clipper import audio_energy, pick_windows  # noqa: E402


def concat_parts(parts, out):
    """Concatène les parties dans l'ordre (copie directe si possible, sinon réencodage)."""
    lst = out + ".list.txt"
    with open(lst, "w") as f:
        for p in parts:
            f.write("file '%s'\n" % os.path.abspath(p).replace("'", "'\\''"))
    r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
                        "-c", "copy", out], capture_output=True, text=True)
    if r.returncode != 0:
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                        "-c:a", "aac", "-b:a", "128k", out], check=True)


def render_segment(src, start, dur, out):
    """Un passage en 720x1280 : fond flou + vidéo centrée, 30 fps."""
    fg = ("[0:v]split[bg][fg];"
          "[bg]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,boxblur=20:5[bgb];"
          "[fg]scale=720:-2[fgs];"
          "[bgb][fgs]overlay=(W-w)/2:(H-h)/2,fps=30,format=yuv420p[v]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.2f}", "-t", f"{dur:.2f}",
                    "-i", src, "-filter_complex", fg, "-map", "[v]", "-map", "0:a:0",
                    "-c:v", "libx264", "-preset", "veryfast", "-b:v", "850k",
                    "-maxrate", "1000k", "-bufsize", "2000k",
                    "-c:a", "aac", "-b:a", "96k", "-ar", "44100", out], check=True)


def join_segments(segs, out, durs, fade):
    """Enchaîne les passages avec fondu vidéo (xfade) et audio (acrossfade)."""
    cmd = ["ffmpeg", "-y", "-v", "error"]
    for s in segs:
        cmd += ["-i", s]
    fc = []
    prev_v, prev_a = "[0:v]", "[0:a]"
    n = len(segs)
    for k in range(1, n):
        off = sum(durs[:k]) - k * fade
        out_v = f"[xv{k}]" if k < n - 1 else "[vout]"
        out_a = f"[xa{k}]" if k < n - 1 else "[aout]"
        fc.append(f"{prev_v}[{k}:v]xfade=transition=fade:duration={fade}:offset={off:.3f}{out_v}")
        fc.append(f"{prev_a}[{k}:a]acrossfade=d={fade}{out_a}")
        prev_v, prev_a = out_v, out_a
    cmd += ["-filter_complex", ";".join(fc), "-map", "[vout]", "-map", "[aout]",
            "-c:v", "libx264", "-preset", "veryfast", "-b:v", "850k",
            "-maxrate", "1000k", "-bufsize", "2000k",
            "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("parts", nargs="+", help="parties vidéo dans l'ordre")
    ap.add_argument("--clips", type=int, default=6, help="nombre de passages")
    ap.add_argument("--duration", type=float, default=39, help="durée de chaque passage (s)")
    ap.add_argument("--fade", type=float, default=0.5, help="durée du fondu entre passages (s)")
    ap.add_argument("--min-gap", type=float, default=60, help="écart minimum entre passages (s)")
    ap.add_argument("--intro-end", type=float, default=0, help="garder l'intro du début (0 à X secondes)")
    ap.add_argument("--out", default="montage_out", help="dossier de sortie")
    a = ap.parse_args()

    os.makedirs(a.out, exist_ok=True)
    full = os.path.join(a.out, "full.mp4")
    concat_parts(a.parts, full)

    energy = audio_energy(full, 0.5)
    z = (energy - energy.mean()) / (energy.std() + 1e-9)
    score = np.clip(z, 0, None)
    if a.intro_end > 0:
        score[: int(a.intro_end / 0.5)] = 0  # les passages ne reprennent pas l'intro
    wins = pick_windows(score, 0.5, a.duration, a.clips, a.min_gap)
    if len(wins) < a.clips:
        sys.exit("Pas assez de passages distincts pour ces réglages.")

    segs, manifest, durs = [], [], []
    if a.intro_end > 0:
        intro = os.path.join(a.out, "seg_00_intro.mp4")
        render_segment(full, 0, a.intro_end, intro)
        segs.append(intro)
        durs.append(a.intro_end)
        manifest.append({"start": 0, "end": a.intro_end, "note": "intro"})
    for i, w in enumerate(wins, 1):
        p = os.path.join(a.out, f"seg_{i:02d}.mp4")
        render_segment(full, w["start"], a.duration, p)
        segs.append(p)
        durs.append(a.duration)
        manifest.append({"start": round(w["start"], 1), "end": round(w["start"] + a.duration, 1),
                         "score": round(w["score"], 3)})
        print(f"[{i}/{a.clips}] {w['start']:.0f}s → {w['start'] + a.duration:.0f}s")

    final = os.path.join(a.out, "montage_tiktok.mp4")
    join_segments(segs, final, durs, a.fade)
    with open(os.path.join(a.out, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"Montage: {final}")


if __name__ == "__main__":
    main()
