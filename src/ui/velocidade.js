// ---------------------------------------------------------------
// Dosador de velocidade: TRANQUILO / NORMAL / RÁPIDO.
// O fator multiplica a velocidade de queda já configurada por fase.
// Ajuste os valores aqui se quiser calibrar a sensação de jogo.
// ---------------------------------------------------------------
export const MODOS = [
  { id: 'tranquilo', icone: '🐢', fator: 0.7 },
  { id: 'normal', icone: '🚶', fator: 1.0 },
  { id: 'rapido', icone: '🐇', fator: 1.3 },
];

const CHAVE_STORAGE = 'ligueAsSilabas.velocidade';
const FONTE_EMOJI =
  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

export function carregarModo() {
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (MODOS.some((m) => m.id === salvo)) return salvo;
  } catch {
    // navegação privada pode bloquear localStorage — segue no padrão
  }
  return 'normal';
}

export function salvarModo(id) {
  try {
    localStorage.setItem(CHAVE_STORAGE, id);
  } catch {
    // sem storage, a escolha vale só até fechar a página
  }
}

export function fatorDoModo(id) {
  return MODOS.find((m) => m.id === id)?.fator ?? 1.0;
}

// Seletor visual: título + 3 ícones grandes, o escolhido destacado.
// aoEscolher(id) é chamado a cada troca (a escolha já sai salva).
export function criarSeletorVelocidade(scene, x, y, aoEscolher) {
  const container = scene.add.container(x, y);
  const espaco = 150;
  const opcoes = [];
  let atual = carregarModo();

  // Sem o título, os três bichinhos não explicam para que servem
  container.add(
    scene.add
      .text(0, -95, 'VELOCIDADE DAS BOLHAS', {
        fontFamily: '"Baloo 2", Arial, sans-serif',
        fontSize: '30px',
        color: '#ffffff',
        stroke: '#2e6da4',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
  );

  MODOS.forEach((modo, i) => {
    const ox = (i - 1) * espaco;
    const aro = scene.add.circle(ox, 0, 58, 0xffffff, 0.35);
    aro.setStrokeStyle(6, 0xffffff, 0.9);
    const icone = scene.add
      .text(ox, 2, modo.icone, { fontFamily: FONTE_EMOJI, fontSize: '56px' })
      .setOrigin(0.5);

    const zona = scene.add
      .zone(ox, 0, 128, 128)
      .setInteractive({ useHandCursor: true });
    zona.on('pointerdown', () => {
      if (atual === modo.id) return;
      atual = modo.id;
      salvarModo(modo.id);
      destacar();
      scene.tweens.add({
        targets: [aro, icone],
        scale: 1.25,
        duration: 120,
        yoyo: true,
      });
      aoEscolher?.(modo.id);
    });

    container.add([aro, icone, zona]);
    opcoes.push({ modo, aro, icone });
  });

  function destacar() {
    for (const o of opcoes) {
      const escolhido = o.modo.id === atual;
      o.aro.setFillStyle(escolhido ? 0xffb830 : 0xffffff, escolhido ? 0.95 : 0.35);
      o.aro.setStrokeStyle(6, 0xffffff, escolhido ? 1 : 0.6);
      o.aro.setScale(escolhido ? 1.12 : 1);
      o.icone.setScale(escolhido ? 1.12 : 1);
      o.icone.setAlpha(escolhido ? 1 : 0.75);
    }
  }
  destacar();

  return container;
}
