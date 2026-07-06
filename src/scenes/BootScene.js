import Phaser from 'phaser';
import dados from '../data/palavras.json';

// Cena inicial: mostra o título enquanto carrega todos os áudios
// (palavras e sílabas), depois vai para a seleção de fase.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Coleta palavras e sílabas únicas de todas as fases
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
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'LIGUE AS SÍLABAS', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#2e6da4',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5);

    // Mostra o título por um instante e vai para a seleção de fase
    this.time.delayedCall(1200, () => {
      this.scene.start('Selecao');
    });
  }
}
