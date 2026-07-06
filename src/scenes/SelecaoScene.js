import Phaser from 'phaser';
import dados from '../data/palavras.json';

// Tela provisória de seleção de fase: 10 botões numerados.
// O menu bonito com estrelas fica para o S6 — esta tela existe
// para testar qualquer fase durante o desenvolvimento.
export default class SelecaoScene extends Phaser.Scene {
  constructor() {
    super('Selecao');
  }

  create() {
    const { width } = this.scale;

    this.add
      .text(width / 2, 130, 'ESCOLHA A FASE', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '56px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#2e6da4',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    // Grade 2 colunas x 5 linhas de botões grandes
    const colunas = 2;
    const larguraBotao = 260;
    const alturaBotao = 150;
    const espacoX = 60;
    const espacoY = 40;
    const inicioY = 320;

    dados.fases.forEach((fase, i) => {
      const col = i % colunas;
      const linha = Math.floor(i / colunas);
      const x =
        width / 2 +
        (col - (colunas - 1) / 2) * (larguraBotao + espacoX);
      const y = inicioY + linha * (alturaBotao + espacoY);

      const botao = this.add
        .rectangle(x, y, larguraBotao, alturaBotao, 0xffffff, 0.9)
        .setStrokeStyle(6, 0x2e6da4, 1);
      botao.setInteractive({ useHandCursor: true });

      this.add
        .text(x, y, String(fase.fase), {
          fontFamily: 'Arial, sans-serif',
          fontSize: '64px',
          fontStyle: 'bold',
          color: '#2e6da4',
        })
        .setOrigin(0.5);

      botao.on('pointerdown', () => {
        this.scene.start('Game', { fase: fase.fase, indicePalavra: 0 });
      });
    });
  }
}
