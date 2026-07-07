import Phaser from 'phaser';
import dados from '../data/palavras.json';
import { criarFundo, CORES_BOLHAS, FONTE } from '../ui/visual.js';
import { criarSeletorVelocidade } from '../ui/velocidade.js';

// Tela provisória de seleção de fase: cartões coloridos numerados.
// O menu definitivo com estrelas fica para o S6.
export default class SelecaoScene extends Phaser.Scene {
  constructor() {
    super('Selecao');
  }

  create() {
    const { width } = this.scale;

    this.fundo = criarFundo(this, null);

    this.add
      .text(width / 2, 100, 'ESCOLHA A FASE', {
        fontFamily: FONTE,
        fontSize: '58px',
        color: '#ffffff',
        stroke: '#2e6da4',
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(2);

    // Dosador de velocidade (vale para todas as fases, fica salvo)
    criarSeletorVelocidade(this, width / 2, 225).setDepth(2);

    const colunas = 2;
    const larguraBotao = 260;
    const alturaBotao = 140;
    const espacoX = 60;
    const espacoY = 36;
    const inicioY = 390;

    dados.fases.forEach((fase, i) => {
      const col = i % colunas;
      const linha = Math.floor(i / colunas);
      const x = width / 2 + (col - (colunas - 1) / 2) * (larguraBotao + espacoX);
      const y = inicioY + linha * (alturaBotao + espacoY);
      const cor = CORES_BOLHAS[i % CORES_BOLHAS.length];

      const botao = this.add.container(x, y).setDepth(2);

      // sombra + cartão colorido + número
      const sombra = this.add
        .rectangle(4, 8, larguraBotao, alturaBotao, 0x1f4e79, 0.25);
      sombra.setOrigin(0.5);
      const carta = this.add
        .rectangle(0, 0, larguraBotao, alturaBotao, cor, 1)
        .setStrokeStyle(6, 0xffffff, 0.95);
      const numero = this.add
        .text(0, -4, String(fase.fase), {
          fontFamily: FONTE,
          fontSize: '72px',
          color: '#ffffff',
          stroke: '#1f4e79',
          strokeThickness: 8,
        })
        .setOrigin(0.5);

      botao.add([sombra, carta, numero]);
      botao.setSize(larguraBotao, alturaBotao);
      botao.setInteractive({ useHandCursor: true });

      // efeito de apertar
      botao.on('pointerdown', () => {
        this.tweens.add({
          targets: botao,
          scale: 0.92,
          duration: 90,
          yoyo: true,
          onComplete: () => {
            this.scene.start('Game', { fase: fase.fase, indicePalavra: 0 });
          },
        });
      });
    });
  }

  update(_time, delta) {
    this.fundo?.atualizar(delta);
  }
}
