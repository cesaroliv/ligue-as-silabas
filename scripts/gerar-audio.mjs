// Gera os áudios narrados (PT-BR) a partir de src/data/palavras.json.
//
// Uso:  npm run gerar-audio
//
// - 1 arquivo por PALAVRA  -> public/assets/audio/palavra_bola.mp3
// - 1 arquivo por SÍLABA   -> public/assets/audio/silaba_bo.mp3
//   (sílabas repetidas entre palavras são geradas uma vez só)
// - Arquivos que já existem são pulados: ao adicionar palavras novas,
//   rode de novo e só o que falta será gerado.

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, access } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ARQUIVO_PALAVRAS = path.join(RAIZ, 'src', 'data', 'palavras.json');
const ARQUIVO_PRONUNCIAS = path.join(RAIZ, 'src', 'data', 'pronuncias.json');
const PASTA_SAIDA = path.join(RAIZ, 'public', 'assets', 'audio');

const VOZ = 'pt-BR-FranciscaNeural';
// Fala mais lenta que o normal: público em alfabetização
const PROSODIA = { rate: '-20%' };

// Falas avulsas do jogo (celebrações etc.): tom mais alto e ritmo
// quase normal dão a entonação festiva
const EXTRAS = [
  ['extra_parabens.mp3', 'Parabéns!', { rate: '-8%', pitch: '+15%' }],
];

async function existe(caminho) {
  try {
    await access(caminho);
    return true;
  } catch {
    return false;
  }
}

const dados = JSON.parse(await readFile(ARQUIVO_PALAVRAS, 'utf8'));

// Mapa sílaba exibida -> texto falado (força pronúncia isolada e tônica;
// sem ele, o TTS pode expandir PA para "para" ou soletrar NE como "êne-é")
const pronuncias = JSON.parse(await readFile(ARQUIVO_PRONUNCIAS, 'utf8'));

// Coleta palavras e sílabas únicas de todas as fases
const palavras = new Set();
const silabas = new Set();
for (const fase of dados.fases) {
  for (const p of fase.palavras) {
    palavras.add(p.palavra);
    for (const s of p.silabas) silabas.add(s);
  }
}

// Lista de tarefas: [nome do arquivo, texto a falar]
// O texto vai em minúsculas para a voz ler naturalmente
// (em maiúsculas ela pode soletrar como sigla).
const tarefas = [];
for (const p of palavras) {
  tarefas.push([`palavra_${p.toLowerCase()}.mp3`, p.toLowerCase()]);
}
const semPronuncia = [];
for (const s of silabas) {
  const falado = pronuncias[s];
  if (!falado) semPronuncia.push(s);
  tarefas.push([`silaba_${s.toLowerCase()}.mp3`, falado ?? s.toLowerCase()]);
}
if (semPronuncia.length) {
  console.warn(
    `AVISO: sílaba(s) sem entrada em pronuncias.json (usando o texto cru, ` +
      `pronúncia pode sair errada): ${semPronuncia.join(', ')}\n` +
      `Adicione-as em src/data/pronuncias.json e rode de novo.`
  );
}
for (const extra of EXTRAS) {
  tarefas.push(extra);
}

await mkdir(PASTA_SAIDA, { recursive: true });

const tts = new MsEdgeTTS();
await tts.setMetadata(VOZ, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

let gerados = 0;
let pulados = 0;

for (const [arquivo, texto, prosodia] of tarefas) {
  const destino = path.join(PASTA_SAIDA, arquivo);
  if (await existe(destino)) {
    pulados++;
    continue;
  }
  const { audioStream } = tts.toStream(texto, prosodia ?? PROSODIA);
  await pipeline(audioStream, createWriteStream(destino));
  gerados++;
  console.log(`gerado: ${arquivo}`);
}

tts.close();
console.log(
  `\nPronto! ${gerados} arquivo(s) gerado(s), ${pulados} já existiam.` +
    `\nPasta: ${PASTA_SAIDA}`
);
