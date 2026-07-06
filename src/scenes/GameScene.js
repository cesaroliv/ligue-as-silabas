import Phaser from 'phaser';
import dados from '../data/palavras.json';

// Aparência das bolhas
const RAIO_BOLHA = 78;
const CORES_BOLHAS = [0xff6b6b, 0xffc93d, 0x6bcb77, 0x4d96ff, 0xff9f45, 0xc780fa];

// Queda suave e constante (pixels por segundo) — multiplicada
// pela configuração de cada fase (fases 9-10 são 15% mais rápidas)
const VELOCIDADE_BASE = 90;

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
    this.velocidadeQueda = VELOCIDADE_BASE * this.fase.multiplicadorVelocidade;
    this.proximaSilaba = 0; // posição da próxima sílaba a acertar
    this.travado = false; // trava toques durante a celebração
    this.bolhas = [];

    // Indicador discreto da fase (ajuda nos testes)
    this.add
      .text(20, 20, `FASE ${this.numeroFase}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setAlpha(0.7)
      .setDepth(10);

    // --- Figura placeholder: retângulo cinza com o nome da palavra ---
    const figura = this.add.graphics().setDepth(10);
    figura.fillStyle(0xd9d9d9, 1);
    figura.fillRoundedRect(width / 2 - 200, 60, 400, 220, 24);
    figura.lineStyle(6, 0xffffff, 1);
    figura.strokeRoundedRect(width / 2 - 200, 60, 400, 220, 24);

    this.textoPalavra = this.add
      .text(width / 2, 170, this.dados.palavra, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '72px',
        fontStyle: 'bold',
        color: '#555555',
      })
      .setOrigin(0.5)
      .setDepth(11);

    // Tocar na figura repete o nome da palavra — a criança pode
    // ouvir de novo quantas vezes quiser
    this.add
      .zone(width / 2, 170, 400, 220)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.falarPalavra());

    // --- Slots vazios, um por sílaba ---
    this.slots = [];
    const larguraSlot = 170;
    const alturaSlot = 130;
    const espacamento = 24;
    const totalSilabas = this.dados.silabas.length;
    const larguraTotal =
      totalSilabas * larguraSlot + (totalSilabas - 1) * espacamento;
    const inicioX = width / 2 - larguraTotal / 2;
    const slotY = 390;

    for (let i = 0; i < totalSilabas; i++) {
      const x = inicioX + i * (larguraSlot + espacamento) + larguraSlot / 2;
      const g = this.add.graphics().setDepth(10);
      g.fillStyle(0xffffff, 0.35);
      g.fillRoundedRect(x - larguraSlot / 2, slotY - alturaSlot / 2, larguraSlot, alturaSlot, 20);
      g.lineStyle(5, 0xffffff, 0.9);
      g.strokeRoundedRect(x - larguraSlot / 2, slotY - alturaSlot / 2, larguraSlot, alturaSlot, 20);
      this.slots.push({ x, y: slotY });
    }

    // --- Bolhas: sílabas corretas + distratores, embaralhadas ---
    const textos = Phaser.Utils.Array.Shuffle([
      ...this.dados.silabas,
      ...this.dados.distratores,
    ]);
    const cores = Phaser.Utils.Array.Shuffle([...CORES_BOLHAS]);

    textos.forEach((silaba, i) => {
      this.criarBolha(silaba, cores[i % cores.length], i, textos.length);
    });

    // Narra a palavra ao aparecer
    this.time.delayedCall(300, () => this.falarPalavra());
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

    const circulo = this.add.circle(0, 0, RAIO_BOLHA, cor, 0.9);
    circulo.setStrokeStyle(6, 0xffffff, 0.9);

    const texto = this.add
      .text(0, 0, silaba, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '60px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#33415c',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    const bolha = this.add.container(x, y, [circulo, texto]).setDepth(1);
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

    for (const bolha of this.bolhas) {
      if (bolha.capturada) continue;
      bolha.y += (this.velocidadeQueda * delta) / 1000;

      // Chegou embaixo: volta ao topo em posição horizontal aleatória
      if (bolha.y > height + RAIO_BOLHA) {
        bolha.y = -RAIO_BOLHA - Phaser.Math.Between(0, 160);
        bolha.x = Phaser.Math.Between(
          RAIO_BOLHA + 20,
          width - RAIO_BOLHA - 20
        );
      }
    }
  }

  tocouBolha(bolha) {
    if (this.travado || bolha.capturada || bolha.balancando) return;

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
      onComplete: () => {
        if (this.proximaSilaba >= this.dados.silabas.length) {
          this.celebrar();
        }
      },
    });
  }

  errou(bolha) {
    bolha.balancando = true;
    this.somErro();
    this.tweens.add({
      targets: bolha,
      angle: { from: -12, to: 12 },
      duration: 90,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        bolha.angle = 0;
        bolha.balancando = false;
      },
    });
  }

  celebrar() {
    this.travado = true;

    // Fala a palavra inteira na celebração
    this.falarPalavra();

    // A palavra pulsa na figura
    this.tweens.add({
      targets: this.textoPalavra,
      scale: 1.35,
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

    const aviso = this.add
      .text(width / 2, height / 2, 'FASE COMPLETA!', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '80px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#2e6da4',
        strokeThickness: 10,
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
