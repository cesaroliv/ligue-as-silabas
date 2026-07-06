import Phaser from 'phaser';

// ---------------------------------------------------------------
// Identidade visual compartilhada: fontes, cores, fundo de cenário
// e texturas geradas em tempo real (bolhas, slots, cartão, confete).
// Nenhuma imagem externa: tudo desenhado via canvas, leve no mobile.
// ---------------------------------------------------------------

export const FONTE = '"Baloo 2", Arial, sans-serif';

export const CORES_BOLHAS = [
  0xff6b6b, 0xffb830, 0x51c15b, 0x4d96ff, 0xff8f45, 0xb46cf0,
];

// Uma paleta de cenário por fase (progressão visual sutil:
// manhã -> dia -> entardecer dourado -> anoitecer suave)
export const PALETAS = [
  { ceuTopo: '#6ec2f0', ceuBase: '#cdeeff', morroTras: 0x8fd07c, morroFrente: 0x66bb5e },
  { ceuTopo: '#63bdef', ceuBase: '#c2ecff', morroTras: 0x94d488, morroFrente: 0x5fb95a },
  { ceuTopo: '#57b6ec', ceuBase: '#bfe9f7', morroTras: 0x9ad77f, morroFrente: 0x58b356 },
  { ceuTopo: '#4fadea', ceuBase: '#bce4f2', morroTras: 0x8ecf74, morroFrente: 0x51ad4f },
  { ceuTopo: '#53a8e8', ceuBase: '#c8e6ee', morroTras: 0xa3d379, morroFrente: 0x5fae51 },
  { ceuTopo: '#5ba3e6', ceuBase: '#d8e8e2', morroTras: 0xa0cd6e, morroFrente: 0x6aaa4c },
  { ceuTopo: '#6a9de2', ceuBase: '#f2e3c8', morroTras: 0xb5c968, morroFrente: 0x7ba648 },
  { ceuTopo: '#7793dd', ceuBase: '#f7d9b6', morroTras: 0xbdb862, morroFrente: 0x86a04a },
  { ceuTopo: '#7d84d4', ceuBase: '#f4c9a8', morroTras: 0xa8a35e, morroFrente: 0x7d9350 },
  { ceuTopo: '#6f74c8', ceuBase: '#eab8a0', morroTras: 0x968f58, morroFrente: 0x6f854e },
];

export function paletaDaFase(numeroFase) {
  return PALETAS[((numeroFase ?? 1) - 1) % PALETAS.length];
}

// Céu em gradiente como textura (1 por fase, cacheada)
function texturaCeu(scene, chave, paleta) {
  if (scene.textures.exists(chave)) return;
  const { width, height } = scene.scale;
  const tx = scene.textures.createCanvas(chave, width, height);
  const ctx = tx.getContext();
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, paleta.ceuTopo);
  g.addColorStop(1, paleta.ceuBase);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  tx.refresh();
}

function nuvem(scene, x, y, escala, alpha) {
  const c = scene.add.container(x, y).setDepth(0);
  const branco = 0xffffff;
  c.add(scene.add.ellipse(0, 0, 150, 62, branco, alpha));
  c.add(scene.add.ellipse(-52, 12, 95, 46, branco, alpha));
  c.add(scene.add.ellipse(55, 12, 100, 48, branco, alpha));
  c.setScale(escala);
  return c;
}

// Monta o cenário (céu, sol, nuvens com deriva, morros em camadas).
// Retorna { atualizar(delta) } para a cena chamar no update().
export function criarFundo(scene, numeroFase) {
  const { width, height } = scene.scale;
  const paleta = paletaDaFase(numeroFase);
  const chaveCeu = `ceu_${numeroFase ?? 'menu'}`;

  texturaCeu(scene, chaveCeu, paleta);
  scene.add.image(width / 2, height / 2, chaveCeu).setDepth(-2);

  // Sol com halo
  scene.add.circle(width - 110, 120, 78, 0xfff3b0, 0.35).setDepth(-1);
  scene.add.circle(width - 110, 120, 52, 0xffe066, 0.9).setDepth(-1);

  // Nuvens em duas profundidades (parallax: a de trás anda mais devagar)
  const nuvens = [
    { obj: nuvem(scene, width * 0.2, 150, 0.7, 0.55), vel: 6 },
    { obj: nuvem(scene, width * 0.75, 260, 0.5, 0.4), vel: 4 },
    { obj: nuvem(scene, width * 0.45, 90, 1.0, 0.75), vel: 9 },
  ];

  // Morros: camada de trás mais clara, da frente mais escura
  scene.add
    .ellipse(width * 0.25, height + 40, width * 1.2, 260, paleta.morroTras, 1)
    .setDepth(0);
  scene.add
    .ellipse(width * 0.85, height + 60, width * 1.1, 300, paleta.morroTras, 1)
    .setDepth(0);
  scene.add
    .ellipse(width * 0.5, height + 90, width * 1.6, 280, paleta.morroFrente, 1)
    .setDepth(0);

  return {
    atualizar(delta) {
      for (const n of nuvens) {
        n.obj.x += (n.vel * delta) / 1000;
        if (n.obj.x > width + 130) n.obj.x = -130;
      }
    },
  };
}

// Bolha com gradiente radial, borda e brilho — 1 textura por cor
export function texturaBolha(scene, cor, raio) {
  const chave = `bolha_${cor.toString(16)}`;
  if (scene.textures.exists(chave)) return chave;

  const d = raio * 2 + 10;
  const tx = scene.textures.createCanvas(chave, d, d);
  const ctx = tx.getContext();
  const c = Phaser.Display.Color.IntegerToColor(cor);
  const claro = `rgba(${Math.min(c.red + 90, 255)},${Math.min(c.green + 90, 255)},${Math.min(c.blue + 90, 255)},1)`;
  const medio = `rgba(${c.red},${c.green},${c.blue},1)`;
  const escuro = `rgba(${Math.max(c.red - 60, 0)},${Math.max(c.green - 60, 0)},${Math.max(c.blue - 60, 0)},1)`;
  const cx = d / 2;

  // corpo com luz vinda de cima-esquerda
  const g = ctx.createRadialGradient(cx - raio * 0.35, cx - raio * 0.4, raio * 0.15, cx, cx, raio);
  g.addColorStop(0, claro);
  g.addColorStop(0.65, medio);
  g.addColorStop(1, escuro);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cx, raio, 0, Math.PI * 2);
  ctx.fill();

  // borda branca translúcida
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cx, raio - 2, 0, Math.PI * 2);
  ctx.stroke();

  // brilho de vidro
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx - raio * 0.35, cx - raio * 0.45, raio * 0.38, raio * 0.22, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.arc(cx - raio * 0.15, cx - raio * 0.62, raio * 0.08, 0, Math.PI * 2);
  ctx.fill();

  tx.refresh();
  return chave;
}

// Slot com contorno tracejado convidativo
export function texturaSlot(scene, largura, altura) {
  const chave = 'slot_tracejado';
  if (scene.textures.exists(chave)) return chave;

  const tx = scene.textures.createCanvas(chave, largura, altura);
  const ctx = tx.getContext();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 5;
  ctx.setLineDash([16, 11]);
  ctx.beginPath();
  ctx.roundRect(4, 4, largura - 8, altura - 8, 22);
  ctx.fill();
  ctx.stroke();
  tx.refresh();
  return chave;
}

// Cartão branco arredondado com sombra suave (painel da figura)
export function texturaCartao(scene, largura, altura) {
  const chave = 'cartao_figura';
  if (scene.textures.exists(chave)) return chave;

  const margem = 34;
  const tx = scene.textures.createCanvas(chave, largura + margem * 2, altura + margem * 2);
  const ctx = tx.getContext();
  ctx.shadowColor = 'rgba(31,78,121,0.30)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(margem, margem, largura, altura, 28);
  ctx.fill();
  tx.refresh();
  return chave;
}

// Quadradinho branco para partículas de confete (tinge-se por cor)
export function texturaConfete(scene) {
  const chave = 'confete';
  if (scene.textures.exists(chave)) return chave;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 12, 12);
  g.generateTexture(chave, 12, 12);
  g.destroy();
  return chave;
}
