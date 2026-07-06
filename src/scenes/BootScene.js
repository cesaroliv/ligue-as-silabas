import Phaser from 'phaser';
import dados from '../data/palavras.json';
import { criarFundo, FONTE } from '../ui/visual.js';

// Cena inicial: mostra o título enquanto carrega os áudios e as
// figuras que já existirem (o manifest diz quais estão na pasta,
// evitando pedir arquivos que ainda não foram produzidos).
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // --- Áudios: palavras e sílabas únicas de todas as fases ---
    const palavras = new Set();
    const silabas = new Set();
    for (const fase of dados.fases) {
      for (const p of fase.palavras) {
        palavras.add(p.palavra.toLowerCase());
        for (const s of p.silabas) silabas.add(s.toLowerCase());
      }
    }
    for (const p of palavras) {
      this.load.audio(`palavra_${p}`, `assets/audio/palavra_${p}.mp3`);
    }
    for (const s of silabas) {
      this.load.audio(`silaba_${s}`, `assets/audio/silaba_${s}.mp3`);
    }

    // --- Figuras: só as que o manifest confirma que existem ---
    this.load.json('figuras-manifest', 'figuras-manifest.json');
    this.load.on('filecomplete-json-figuras-manifest', (_chave, _tipo, lista) => {
      for (const arquivo of lista) {
        const chave = arquivo.replace(/\.png$/, '');
        this.load.image(chave, `assets/figuras/${arquivo}`);
      }
    });
  }

  create() {
    const { width, height } = this.scale;

    this.fundo = criarFundo(this, null);

    this.add
      .text(width / 2, height / 2 - 60, 'LIGUE AS SÍLABAS', {
        fontFamily: FONTE,
        fontSize: '68px',
        color: '#ffffff',
        stroke: '#2e6da4',
        strokeThickness: 10,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(1);

    // Mostra o título por um instante e vai para a seleção de fase
    this.time.delayedCall(1200, () => {
      this.scene.start('Selecao');
    });
  }

  update(_time, delta) {
    this.fundo?.atualizar(delta);
  }
}
