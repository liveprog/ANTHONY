# clipper

Trouve les meilleurs moments d'une vidéo et sort des clips verticaux 9:16 (1080×1920), prêts pour Shorts / TikTok / Reels.

## Ce qu'il fait
1. Télécharge la vidéo si on lui donne une URL YouTube (yt-dlp), ou prend un fichier local.
2. Mesure l'énergie audio par tranche de 0,5 s (les pics de réaction, cris, rires, rage…).
3. Si un fichier `.srt` est fourni, ajoute un score pour les mots-clés de hype (« oh », « mdr », « wtf »…). Les sous-titres sont aussi incrustés dans chaque clip.
4. Choisit les N meilleures fenêtres sans chevauchement et les exporte en MP4.

## Usage
```bash
# Fichier local
python3 clipper/clipper.py video.mp4 --clips 8 --duration 45 --out clips/

# URL YouTube (nécessite que yt-dlp puisse télécharger, voir plus bas)
python3 clipper/clipper.py "https://www.youtube.com/watch?v=XXXX" --srt sous-titres.srt --clips 8
```

Options : `--duration` (s), `--min-gap` (écart min. entre deux clips, s), `--no-subs`.

Sortie : `clips/clip_01.mp4`, … et `clips/manifest.json` (début, fin, score de chaque clip).

## Dépendances
- `ffmpeg` / `ffprobe`
- `yt-dlp` (pour les URL)
- Python 3 + `numpy`

## Limites connues
- Le scoring est une heuristique (audio + mots-clés). Il remonte les moments « chauds », pas forcément les plus drôles : à relire avant publication.
- Les sous-titres ne sont pas générés automatiquement : il faut fournir un `.srt`.
- Pour YouTube, yt-dlp a besoin d'un runtime JavaScript pour résoudre les formats (`--js-runtimes node`). Dans l'environnement actuel ce n'est pas encore en place.
