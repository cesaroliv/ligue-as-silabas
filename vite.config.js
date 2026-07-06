import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const PASTA_FIGURAS = path.join(RAIZ, 'public', 'assets', 'figuras');

function listarFiguras() {
  try {
    return fs.readdirSync(PASTA_FIGURAS).filter((f) => f.endsWith('.png'));
  } catch {
    return [];
  }
}

// O jogo pergunta a este manifest quais figuras EXISTEM antes de
// carregá-las. Assim, figuras ainda não produzidas não geram erros 404
// e adicionar um PNG na pasta não exige mexer em código.
function pluginManifestFiguras() {
  return {
    name: 'manifest-figuras',
    // Em desenvolvimento: responde na hora, sempre atualizado
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.split('?')[0] === '/figuras-manifest.json') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(listarFiguras()));
        } else {
          next();
        }
      });
    },
    // No build final: grava o manifest como arquivo estático
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'figuras-manifest.json',
        source: JSON.stringify(listarFiguras()),
      });
    },
  };
}

export default defineConfig({
  plugins: [pluginManifestFiguras()],
});
