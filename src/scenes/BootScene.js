import Phaser from 'phaser';

// Cena inicial: por enquanto só mostra o título centralizado.
// Nos próximos segmentos ela vai carregar assets e levar ao Menu.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
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

    // Mostra o título por um instante e entra no jogo
    this.time.delayedCall(1200, () => {
      this.scene.start('Game');
    });
  }
}
