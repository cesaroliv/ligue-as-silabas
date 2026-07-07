import Phaser from 'phaser';
import { criarFundo, texturaBolha, CORES_BOLHAS, FONTE } from '../ui/visual.js';
import { criarSeletorVelocidade } from '../ui/velocidade.js';
import { somLigado, alternarSom, aplicarSom, iniciarMusica } from '../ui/som.js';

// ✏️ Edite aqui o texto do rodapé:
const RODAPE = 'feito com ❤ por Cesar';

const FONTE_EMOJI =
  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

// Tela inicial: logo, JOGAR gigante, som e velocidade.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.scale;

    this.fundo = criarFundo(this, null);
    aplicarSom(this.game);

    // A música começa no primeiro toque (regra dos navegadores:
    // áudio só depois de um gesto do usuário)
    this.input.once('pointerdown', () => iniciarMusica(this.game));

    // --- Logo: título em arco com bolhas decorativas ---
    const bolhasDeco = [
      { x: width / 2 - 240, y: 190, cor: CORES_BOLHAS[0], r: 52 },
      { x: width / 2 + 235, y: 165, cor: CORES_BOLHAS[3], r: 44 },
      { x: width / 2 - 150, y: 330, cor: CORES_BOLHAS[2], r: 30 },
      { x: width / 2 + 180, y: 320, cor: CORES_BOLHAS[5], r: 36 },
    ];
    for (const b of bolhasDeco) {
      const img = this.add
        .image(b.x, b.y, texturaBolha(this, b.cor, 78))
        .setScale(b.r / 78)
        .setAlpha(0.9)
        .setDepth(1);
      this.tweens.add({
        targets: img,
        y: b.y - 14,
        duration: Phaser.Math.Between(1600, 2400),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const titulo = this.add
      .text(width / 2, 240, 'LIGUE AS\nSÍLABAS', {
        fontFamily: FONTE,
        fontSize: '100px',
        color: '#ffffff',
        stroke: '#2e6da4',
        strokeThickness: 14,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(2);
    this.tweens.add({
      targets: titulo,
      scale: 1.03,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // --- Botão gigante JOGAR ---
    const jogar = this.add.container(width / 2, 620).setDepth(2);
    const sombra = this.add.rectangle(5, 10, 460, 170, 0x14304d, 0.35);
    const carta = this.add
      .rectangle(0, 0, 460, 170, 0x51c15b, 1)
      .setStrokeStyle(8, 0xffffff, 0.95);
    const rotulo = this.add
      .text(0, -4, '▶  JOGAR', {
        fontFamily: FONTE,
        fontSize: '76px',
        color: '#ffffff',
        stroke: '#1f4e79',
        strokeThickness: 10,
      })
      .setOrigin(0.5);
    jogar.add([sombra, carta, rotulo]);
    jogar.setSize(460, 170);
    jogar.setInteractive({ useHandCursor: true });
    this.tweens.add({
      targets: jogar,
      scale: 1.04,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    jogar.on('pointerdown', () => {
      this.tweens.killTweensOf(jogar);
      this.tweens.add({
        targets: jogar,
        scale: 0.92,
        duration: 90,
        yoyo: true,
        onComplete: () => this.scene.start('Selecao'),
      });
    });

    // --- Botão de som (canto superior direito) ---
    const fundoSom = this.add
      .circle(width - 66, 66, 46, 0xffffff, 0.55)
      .setStrokeStyle(5, 0xffffff, 0.85)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    const iconeSom = this.add
      .text(width - 66, 68, somLigado() ? '🔊' : '🔇', {
        fontFamily: FONTE_EMOJI,
        fontSize: '42px',
      })
      .setOrigin(0.5)
      .setDepth(2);
    fundoSom.on('pointerdown', () => {
      const ligado = alternarSom(this.game);
      iconeSom.setText(ligado ? '🔊' : '🔇');
      iniciarMusica(this.game); // este toque também é um gesto válido
    });

    // --- Dosador de velocidade ---
    criarSeletorVelocidade(this, width / 2, 950).setDepth(2);

    // --- Rodapé ---
    this.add
      .text(width / 2, height - 34, RODAPE, {
        fontFamily: FONTE,
        fontSize: '26px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setAlpha(0.75)
      .setDepth(2);
  }

  update(_time, delta) {
    this.fundo?.atualizar(delta);
  }
}
