import Phaser from 'phaser';
import dados from '../data/palavras.json';
import { criarFundo, CORES_BOLHAS, FONTE } from '../ui/visual.js';
import { criarSeletorVelocidade } from '../ui/velocidade.js';
import {
  estrelasDaFase,
  faseDesbloqueada,
  apagarProgresso,
} from '../ui/progresso.js';

const FONTE_EMOJI =
  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

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
      .text(width / 2, 78, 'ESCOLHA A FASE', {
        fontFamily: FONTE,
        fontSize: '58px',
        color: '#ffffff',
        stroke: '#2e6da4',
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(2);

    // Dosador de velocidade (vale para todas as fases, fica salvo)
    criarSeletorVelocidade(this, width / 2, 252).setDepth(2);

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
      const aberta = faseDesbloqueada(fase.fase);
      const cor = aberta ? CORES_BOLHAS[i % CORES_BOLHAS.length] : 0x9fb0bd;

      const botao = this.add.container(x, y).setDepth(2);

      const sombra = this.add
        .rectangle(4, 8, larguraBotao, alturaBotao, 0x1f4e79, 0.25);
      sombra.setOrigin(0.5);
      const carta = this.add
        .rectangle(0, 0, larguraBotao, alturaBotao, cor, 1)
        .setStrokeStyle(6, 0xffffff, aberta ? 0.95 : 0.5);
      botao.add([sombra, carta]);

      if (!aberta) {
        // Fase bloqueada: cadeado no lugar do número
        botao.add(
          this.add
            .text(0, -2, '🔒', { fontFamily: FONTE_EMOJI, fontSize: '58px' })
            .setOrigin(0.5)
            .setAlpha(0.9)
        );
        botao.setSize(larguraBotao, alturaBotao);
        return;
      }

      const numero = this.add
        .text(0, -22, String(fase.fase), {
          fontFamily: FONTE,
          fontSize: '62px',
          color: '#ffffff',
          stroke: '#1f4e79',
          strokeThickness: 8,
        })
        .setOrigin(0.5);
      botao.add(numero);

      // Estrelinhas conquistadas na fase
      const conquistadas = estrelasDaFase(fase.fase);
      for (let e = 0; e < 3; e++) {
        const estrela = this.add
          .star((e - 1) * 46, 42, 5, 8, 17, e < conquistadas ? 0xffd23e : 0x1f4e79, e < conquistadas ? 1 : 0.35)
          .setStrokeStyle(3, 0xffffff, e < conquistadas ? 1 : 0.4);
        botao.add(estrela);
      }

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

    this.criarBotaoApagar();
  }

  // Botão discreto para recomeçar do zero (com confirmação)
  criarBotaoApagar() {
    const { width, height } = this.scale;

    const alvo = this.add
      .circle(width - 52, height - 52, 34, 0xffffff, 0.35)
      .setStrokeStyle(3, 0xffffff, 0.6)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(width - 52, height - 52, '🗑', { fontFamily: FONTE_EMOJI, fontSize: '30px' })
      .setOrigin(0.5)
      .setAlpha(0.8)
      .setDepth(2);

    alvo.on('pointerdown', () => this.confirmarApagar());
  }

  confirmarApagar() {
    const { width, height } = this.scale;
    const grupo = [];
    let decidido = false;

    const veu = this.add
      .rectangle(width / 2, height / 2, width, height, 0x1f3a5c, 0.6)
      .setDepth(10)
      .setInteractive();
    grupo.push(veu);

    grupo.push(
      this.add
        .text(width / 2, height / 2 - 160, 'APAGAR TODO\nO PROGRESSO?', {
          fontFamily: FONTE,
          fontSize: '58px',
          color: '#ffffff',
          stroke: '#b33939',
          strokeThickness: 10,
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(11)
    );

    const botaoConfirma = (x, cor, rotulo, acao) => {
      const c = this.add.container(x, height / 2 + 60).setDepth(11);
      const carta = this.add
        .rectangle(0, 0, 240, 110, cor, 1)
        .setStrokeStyle(5, 0xffffff, 0.95);
      const texto = this.add
        .text(0, -2, rotulo, {
          fontFamily: FONTE,
          fontSize: '44px',
          color: '#ffffff',
          stroke: '#1f4e79',
          strokeThickness: 7,
        })
        .setOrigin(0.5);
      c.add([carta, texto]);
      c.setSize(240, 110);
      c.setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => {
        if (decidido) return;
        decidido = true;
        acao();
      });
      grupo.push(c);
    };

    botaoConfirma(width / 2 - 140, 0xb33939, 'SIM', () => {
      apagarProgresso();
      this.scene.restart();
    });
    botaoConfirma(width / 2 + 140, 0x51c15b, 'NÃO', () => {
      for (const g of grupo) g.destroy();
    });
  }

  update(_time, delta) {
    this.fundo?.atualizar(delta);
  }
}
