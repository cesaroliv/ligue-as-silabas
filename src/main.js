import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import SelecaoScene from './scenes/SelecaoScene.js';
import GameScene from './scenes/GameScene.js';

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
  scene: [BootScene, MenuScene, SelecaoScene, GameScene],
};

// Espera a fonte do jogo estar pronta antes de desenhar qualquer texto
// (sem isso o Phaser mediria o texto com a fonte errada).
try {
  await document.fonts.load('700 64px "Baloo 2"');
} catch {
  // sem a fonte, segue com a reserva (Arial)
}

// Guardar a instância em window ajuda a inspecionar o jogo no console
// do navegador e permite testes automatizados.
window.game = new Phaser.Game(config);
