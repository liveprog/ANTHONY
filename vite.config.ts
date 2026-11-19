import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

function lister(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom)
    return statSync(chemin).isDirectory() ? lister(chemin) : [chemin]
  })
}

/** Écrit dist/sw.js : le modèle, la liste des fichiers à mettre en cache et une version
 *  calculée sur leur contenu (elle change dès qu'un fichier change). */
function serviceWorkerHorsLigne(): Plugin {
  let sortie = ''
  return {
    name: 'service-worker-hors-ligne',
    apply: 'build',
    configResolved(config) {
      sortie = join(config.root, config.build.outDir)
    },
    closeBundle() {
      const fichiers = lister(sortie)
        .map((f) => relative(sortie, f).split(sep).join('/'))
        .filter((f) => f !== 'sw.js')
        .sort()
      const empreinte = createHash('sha256')
      for (const f of fichiers) {
        empreinte.update(f)
        empreinte.update(readFileSync(join(sortie, f)))
      }
      const modele = readFileSync(join(import.meta.dirname, 'src/sw.template.js'), 'utf8')
      empreinte.update(modele)
      const version = empreinte.digest('hex').slice(0, 12)
      const liste = ['./', ...fichiers.map((f) => `./${f}`)]
      if (!modele.includes("'antho-fit-__VERSION__'") || !modele.includes('const FICHIERS = __FICHIERS__')) {
        throw new Error('sw.template.js : marqueurs de version ou de fichiers introuvables')
      }
      writeFileSync(
        join(sortie, 'sw.js'),
        modele
          .replace("'antho-fit-__VERSION__'", `'antho-fit-${version}'`)
          .replace('const FICHIERS = __FICHIERS__', `const FICHIERS = ${JSON.stringify(liste, null, 2)}`),
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), serviceWorkerHorsLigne()],
  base: './',
  build: {
    // Noms de fichiers stables : la publication remplace les mêmes chemins.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
