import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';

// Resolução base em retrato (mobile-first).
// O modo FIT redimensiona o canvas para caber em qualquer tela
// mantendo a proporção — funciona em celular, tablet e desktop.
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#87CEEB', // azul-céu
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
  },
  scene: [BootScene],
};

new Phaser.Game(config);
