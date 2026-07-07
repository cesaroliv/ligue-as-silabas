// ---------------------------------------------------------------
// Progresso do jogador: estrelas por fase e fases desbloqueadas.
// Tudo salvo no navegador (localStorage) — sem login, sem servidor.
// ---------------------------------------------------------------

const CHAVE = 'ligueAsSilabas.progresso';

function ler() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? {};
  } catch {
    return {};
  }
}

function gravar(progresso) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(progresso));
  } catch {
    // navegação privada: o progresso vale só até fechar a página
  }
}

export function estrelasDaFase(numeroFase) {
  return ler().estrelas?.[numeroFase] ?? 0;
}

export function faseDesbloqueada(numeroFase) {
  return numeroFase <= (ler().desbloqueada ?? 1);
}

// Registra o resultado de uma fase completada: guarda a MELHOR
// pontuação de estrelas e desbloqueia a fase seguinte.
export function registrarFase(numeroFase, estrelas) {
  const p = ler();
  p.estrelas = p.estrelas ?? {};
  p.estrelas[numeroFase] = Math.max(p.estrelas[numeroFase] ?? 0, estrelas);
  p.desbloqueada = Math.max(p.desbloqueada ?? 1, numeroFase + 1);
  gravar(p);
}

export function apagarProgresso() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // sem storage, não há o que apagar
  }
}

// Critério generoso (nunca zero ao completar): conta as palavras
// feitas SEM NENHUM toque errado ("de primeira") dentro da fase.
//   5 palavras perfeitas -> 3 estrelas
//   3 ou 4               -> 2 estrelas
//   0 a 2                -> 1 estrela
export function calcularEstrelas(palavrasPerfeitas) {
  if (palavrasPerfeitas >= 5) return 3;
  if (palavrasPerfeitas >= 3) return 2;
  return 1;
}
