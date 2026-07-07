// ---------------------------------------------------------------
// Liga/desliga geral de som (efeitos, narração e música), salvo
// no navegador. A música de fundo é gerada em tempo real via
// Web Audio (sem arquivo): um dedilhado calmo em pentatônica.
// Para usar uma música própria no futuro, coloque um MP3 em
// public/assets/audio/ e peça para ativar no código.
// ---------------------------------------------------------------

const CHAVE = 'ligueAsSilabas.som';
const VOLUME_MUSICA = 0.05;

export function somLigado() {
  try {
    return localStorage.getItem(CHAVE) !== 'off';
  } catch {
    return true;
  }
}

export function alternarSom(game) {
  const ligado = !somLigado();
  try {
    localStorage.setItem(CHAVE, ligado ? 'on' : 'off');
  } catch {
    // sem storage, vale só para esta visita
  }
  aplicarSom(game);
  return ligado;
}

// Aplica o estado salvo ao jogo (efeitos Phaser + música)
export function aplicarSom(game) {
  game.sound.mute = !somLigado();
  if (ganhoMusica) {
    ganhoMusica.gain.value = somLigado() ? VOLUME_MUSICA : 0;
  }
}

// --- Música de fundo generativa -------------------------------

let musicaAtiva = false;
let ganhoMusica = null;

// Melodia calma: pentatônica de dó maior, duas vozes suaves
const MELODIA = [261.63, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66, 329.63];
const BAIXO = [130.81, 98.0, 110.0, 98.0];

export function iniciarMusica(game) {
  if (musicaAtiva) {
    aplicarSom(game);
    return;
  }
  const ctx = game.sound.context;
  if (!ctx) return;
  musicaAtiva = true;

  ganhoMusica = ctx.createGain();
  ganhoMusica.gain.value = somLigado() ? VOLUME_MUSICA : 0;
  ganhoMusica.connect(ctx.destination);

  let passo = 0;
  const nota = (freq, quando, duracao, volume) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, quando);
    gain.gain.exponentialRampToValueAtTime(volume, quando + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, quando + duracao);
    osc.connect(gain);
    gain.connect(ganhoMusica);
    osc.start(quando);
    osc.stop(quando + duracao + 0.05);
  };

  // agenda uma "batida" por vez; setInterval segue mesmo com a aba
  // parada e o AudioContext suspenso não toca nada (sem acumular)
  setInterval(() => {
    if (ctx.state !== 'running' || ganhoMusica.gain.value === 0) {
      passo++;
      return;
    }
    const agora = ctx.currentTime + 0.05;
    nota(MELODIA[passo % MELODIA.length], agora, 1.4, 1);
    if (passo % 2 === 0) {
      nota(BAIXO[(passo / 2) % BAIXO.length], agora, 2.2, 0.7);
    }
    passo++;
  }, 1100);
}
