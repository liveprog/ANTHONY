import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { renameSync } from 'node:fs'
import { join } from 'node:path'

/** Version « un seul fichier » : tout (code, styles, police) est dans un unique .html,
 *  qui s'ouvre sans connexion, directement depuis le disque. */
function fichierUnique(): Plugin {
  let sortie = ''
  return {
    name: 'fichier-unique-hors-ligne',
    apply: 'build',
    configResolved(config) {
      sortie = join(config.root, config.build.outDir)
    },
    // Ni manifeste ni icônes à côté : on retire ces liens pour ne rien chercher qui n'existe pas.
    transformIndexHtml(html) {
      return html.replace(/\s*<link rel="(?:manifest|apple-touch-icon|icon)"[^>]*>/g, '')
    },
    closeBundle() {
      renameSync(join(sortie, 'index.html'), join(sortie, 'antho-fit-hors-ligne.html'))
    },
  }
}

export default defineConfig({
  plugins: [react(), viteSingleFile(), fichierUnique()],
  base: './',
  publicDir: false,
  build: { outDir: 'dist-offline', emptyOutDir: true },
})
