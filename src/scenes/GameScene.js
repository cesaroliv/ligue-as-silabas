import Phaser from 'phaser';
import dados from '../data/palavras.json';
import {
  criarFundo,
  texturaBolha,
  texturaSlot,
  texturaCartao,
  texturaConfete,
  CORES_BOLHAS,
  FONTE,
} from '../ui/visual.js';
import {
  MODOS,
  carregarModo,
  fatorDoModo,
  criarSeletorVelocidade,
} from '../ui/velocidade.js';

const RAIO_BOLHA = 78;

// Queda suave e constante (pixels por segundo) — multiplicada
// pela configuração de cada fase (fases 9-10 são 15% mais rápidas)
const VELOCIDADE_BASE = 90;

// Painel da figura
const CARTAO = { x: 360, y: 220, largura: 420, altura: 320 };

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.numeroFase = data.fase ?? 1;
    this.indicePalavra = data.indicePalavra ?? 0;
  }

  create() {
    const { width } = this.scale;

    this.fase = dados.fases.find((f) => f.fase === this.numeroFase);
    this.dados = this.fase.palavras[this.indicePalavra];
    this.modoVelocidade = carregarModo();
    this.aplicarVelocidade();
    this.proximaSilaba = 0; // posição da próxima sílaba a acertar
    this.travado = false; // trava toques durante a celebração
    this.pausado = false; // dosador de velocidade aberto
    this.bolhas = [];

    this.fundo = criarFundo(this, this.numeroFase);

    this.criarPainelFigura();
    this.criarPontinhosProgresso();
    this.criarSlots();
    this.criarBolhas();
    this.criarBotaoVelocidade();

    // Narra a palavra ao aparecer
    this.time.delayedCall(300, () => this.falarPalavra());
  }

  // Velocidade final = base * configuração da fase * modo escolhido
  aplicarVelocidade() {
    this.velocidadeQueda =
      VELOCIDADE_BASE *
      this.fase.multiplicadorVelocidade *
      fatorDoModo(this.modoVelocidade);
  }

  // --- Botãozinho discreto no canto: abre o dosador de velocidade ---
  criarBotaoVelocidade() {
    const { width } = this.scale;
    const modo = MODOS.find((m) => m.id === this.modoVelocidade);

    const fundo = this.add
      .circle(width - 46, 46, 34, 0xffffff, 0.55)
      .setStrokeStyle(4, 0xffffff, 0.8)
      .setDepth(12);
    this.iconeVelocidade = this.add
      .text(width - 46, 48, modo.icone, {
        fontFamily:
          '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
        fontSize: '34px',
      })
      .setOrigin(0.5)
      .setDepth(12);

    fundo
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.abrirDosador());
  }

  abrirDosador() {
    if (this.travado || this.pausado) return;
    this.pausado = true; // as bolhas congelam enquanto escolhe

    const { width, height } = this.scale;
    const grupo = [];

    const veu = this.add
      .rectangle(width / 2, height / 2, width, height, 0x1f3a5c, 0.55)
      .setDepth(40)
      .setInteractive(); // engole toques nas bolhas atrás
    grupo.push(veu);

    const seletor = criarSeletorVelocidade(this, width / 2, height / 2, (id) => {
      this.modoVelocidade = id;
      this.aplicarVelocidade();
      this.iconeVelocidade.setText(MODOS.find((m) => m.id === id).icone);
      fechar();
    });
    seletor.setDepth(41).setScale(1.3);
    grupo.push(seletor);

    let fechado = false;
    const fechar = () => {
      if (fechado) return; // o toque numa opção também atinge o véu atrás
      fechado = true;
      for (const g of grupo) g.destroy();
      this.pausado = false;
    };
    // tocar fora das opções também fecha (sem trocar nada)
    veu.on('pointerdown', fechar);
  }

  // --- Painel superior: cartão branco com a figura da palavra ---
  criarPainelFigura() {
    const { x, y, largura, altura } = CARTAO;

    this.add
      .image(x, y, texturaCartao(this, largura, altura))
      .setDepth(10);

    const chaveFigura = `figura_${this.dados.palavra.toLowerCase()}`;
    if (this.textures.exists(chaveFigura)) {
      // Figura real: encaixa dentro do cartão mantendo a proporção
      this.figura = this.add.image(x, y, chaveFigura).setDepth(11);
      const escala = Math.min(
        (largura - 60) / this.figura.width,
        (altura - 60) / this.figura.height
      );
      this.figura.setScale(escala);
    } else {
      // Fallback: enquanto o PNG não existe, mostra o nome da palavra
      this.figura = this.add
        .text(x, y, this.dados.palavra, {
          fontFamily: FONTE,
          fontSize: '76px',
          color: '#9aa5b1',
        })
        .setOrigin(0.5)
        .setDepth(11);
    }

    // Tocar no cartão repete o nome da palavra — a criança pode
    // ouvir de novo quantas vezes quiser
    this.add
      .zone(x, y, largura, altura)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.falarPalavra());
  }

  // --- Pontinhos de progresso: um por palavra da fase ---
  criarPontinhosProgresso() {
    const total = this.fase.palavras.length;
    this.pontinhos = [];
    const raio = 13;
    const espaco = 42;
    const inicioX = 44;
    const yPonto = 46;

    for (let i = 0; i < total; i++) {
      const completo = i < this.indicePalavra;
      const ponto = this.add
        .circle(inicioX + i * espaco, yPonto, raio, 0xffffff, completo ? 1 : 0.3)
        .setStrokeStyle(4, 0xffffff, 0.9)
        .setDepth(12);
      if (completo) ponto.setFillStyle(0xffb830, 1);
      this.pontinhos.push(ponto);
    }
  }

  // --- Slots tracejados, um por sílaba ---
  criarSlots() {
    this.slots = [];
    const larguraSlot = 170;
    const alturaSlot = 130;
    const espacamento = 24;
    const totalSilabas = this.dados.silabas.length;
    const larguraTotal =
      totalSilabas * larguraSlot + (totalSilabas - 1) * espacamento;
    const inicioX = this.scale.width / 2 - larguraTotal / 2;
    const slotY = 480;

    const chave = texturaSlot(this, larguraSlot, alturaSlot);
    for (let i = 0; i < totalSilabas; i++) {
      const x = inicioX + i * (larguraSlot + espacamento) + larguraSlot / 2;
      this.add.image(x, slotY, chave).setDepth(10);
      this.slots.push({ x, y: slotY });
    }
  }

  criarBolhas() {
    const textos = Phaser.Utils.Array.Shuffle([
      ...this.dados.silabas,
      ...this.dados.distratores,
    ]);
    const cores = Phaser.Utils.Array.Shuffle([...CORES_BOLHAS]);

    textos.forEach((silaba, i) => {
      this.criarBolha(silaba, cores[i % cores.length], i, textos.length);
    });
  }

  criarBolha(silaba, cor, ordem, totalBolhas) {
    const { width } = this.scale;

    // Cada bolha nasce na sua "faixa" horizontal para não empilharem
    const margem = RAIO_BOLHA + 20;
    const larguraFaixa = (width - margem * 2) / totalBolhas;
    const x =
      margem +
      ordem * larguraFaixa +
      larguraFaixa / 2 +
      Phaser.Math.Between(-20, 20);

    // Nascem escalonadas acima da tela, para entrarem aos poucos
    const y = -RAIO_BOLHA - ordem * 280;

    const imagem = this.add.image(0, 0, texturaBolha(this, cor, RAIO_BOLHA));
    const texto = this.add
      .text(0, -4, silaba, {
        fontFamily: FONTE,
        fontSize: '62px',
        color: '#ffffff',
        stroke: '#33415c',
        strokeThickness: 9,
      })
      .setOrigin(0.5);

    const bolha = this.add.container(x, y, [imagem, texto]).setDepth(1);
    bolha.silaba = silaba;
    bolha.capturada = false;
    bolha.balancando = false;

    // Área de toque circular, um pouco maior que a bolha (dedos pequenos)
    bolha.setInteractive(
      new Phaser.Geom.Circle(0, 0, RAIO_BOLHA + 14),
      Phaser.Geom.Circle.Contains
    );
    bolha.on('pointerdown', () => this.tocouBolha(bolha));

    this.bolhas.push(bolha);
  }

  update(_time, delta) {
    const { width, height } = this.scale;

    this.fundo?.atualizar(delta);

    if (this.pausado) return; // dosador aberto: bolhas congeladas

    for (const bolha of this.bolhas) {
      if (bolha.capturada) continue;
      bolha.y += (this.velocidadeQueda * delta) / 1000;

      // Chegou embaixo: volta ao topo em posição horizontal aleatória
      if (bolha.y > height + RAIO_BOLHA) {
        bolha.y = -RAIO_BOLHA - Phaser.Math.Between(0, 160);
        bolha.x = Phaser.Math.Between(RAIO_BOLHA + 20, width - RAIO_BOLHA - 20);
      }
    }
  }

  falarPalavra() {
    this.tocarAudio(`palavra_${this.dados.palavra.toLowerCase()}`);
  }

  tocarAudio(chave) {
    if (this.cache.audio.exists(chave)) {
      this.sound.play(chave);
    }
  }

  // Som curto, suave e neutro para o erro — gerado na hora,
  // nunca um som "de derrota"
  somErro() {
    const ctx = this.sound.context;
    if (!ctx || ctx.state !== 'running') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(190, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  tocouBolha(bolha) {
    if (this.travado || this.pausado || bolha.capturada || bolha.balancando)
      return;

    const silabaEsperada = this.dados.silabas[this.proximaSilaba];

    if (bolha.silaba === silabaEsperada) {
      this.acertou(bolha);
    } else {
      this.errou(bolha);
    }
  }

  acertou(bolha) {
    bolha.capturada = true;
    bolha.disableInteractive();
    bolha.setDepth(20); // voa por cima de tudo

    this.tocarAudio(`silaba_${bolha.silaba.toLowerCase()}`);

    const slot = this.slots[this.proximaSilaba];
    this.proximaSilaba++;

    this.tweens.add({
      targets: bolha,
      x: slot.x,
      y: slot.y,
      scale: 0.82,
      duration: 450,
      ease: 'Back.easeOut',
      onComplete: () => this.encaixou(bolha, slot),
    });
  }

  // Animação de "encaixe": squash da bolha + anel de brilho no slot
  encaixou(bolha, slot) {
    this.tweens.add({
      targets: bolha,
      scaleX: 0.94,
      scaleY: 0.68,
      duration: 90,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => bolha.setScale(0.82),
    });

    const anel = this.add
      .circle(slot.x, slot.y, RAIO_BOLHA * 0.9)
      .setStrokeStyle(8, 0xffffff, 0.9)
      .setDepth(21)
      .setScale(0.6);
    this.tweens.add({
      targets: anel,
      scale: 1.35,
      alpha: 0,
      duration: 380,
      ease: 'Cubic.easeOut',
      onComplete: () => anel.destroy(),
    });

    if (this.proximaSilaba >= this.dados.silabas.length) {
      this.celebrar();
    }
  }

  confete(x, y, quantidade) {
    const particulas = this.add.particles(x, y, texturaConfete(this), {
      speed: { min: 240, max: 520 },
      angle: { min: 230, max: 310 }, // jorra para cima, abre em leque
      gravityY: 900,
      lifespan: 1400,
      quantity: quantidade,
      scale: { start: 1, end: 0.2 },
      rotate: { min: 0, max: 360 },
      tint: CORES_BOLHAS,
      emitting: false,
    });
    particulas.setDepth(25);
    particulas.explode(quantidade);
    this.time.delayedCall(1600, () => particulas.destroy());
  }

  celebrar() {
    this.travado = true;

    // Fala a palavra inteira, solta confete e acende o pontinho
    this.falarPalavra();
    this.confete(CARTAO.x, CARTAO.y - 40, 46);

    const ponto = this.pontinhos[this.indicePalavra];
    ponto.setFillStyle(0xffb830, 1);
    this.tweens.add({
      targets: ponto,
      scale: 1.6,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // A figura pulsa
    this.tweens.add({
      targets: this.figura,
      scale: this.figura.scale * 1.18,
      duration: 250,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });

    this.time.delayedCall(1500, () => {
      const proxima = this.indicePalavra + 1;
      if (proxima >= this.fase.palavras.length) {
        this.faseCompleta();
      } else {
        this.scene.restart({ fase: this.numeroFase, indicePalavra: proxima });
      }
    });
  }

  faseCompleta() {
    const { width, height } = this.scale;

    this.confete(width / 2, height / 2, 80);

    const aviso = this.add
      .text(width / 2, height / 2, 'FASE COMPLETA!', {
        fontFamily: FONTE,
        fontSize: '84px',
        color: '#ffffff',
        stroke: '#2e6da4',
        strokeThickness: 12,
        align: 'center',
      })
      .setOrigin(0.5)
      .setScale(0)
      .setDepth(30);

    this.tweens.add({
      targets: aviso,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
    });

    // Avança sozinho para a próxima fase; depois da 10ª volta à seleção
    this.time.delayedCall(3000, () => {
      const proximaFase = this.numeroFase + 1;
      const existe = dados.fases.some((f) => f.fase === proximaFase);
      if (existe) {
        this.scene.restart({ fase: proximaFase, indicePalavra: 0 });
      } else {
        this.scene.start('Selecao');
      }
    });
  }

}
