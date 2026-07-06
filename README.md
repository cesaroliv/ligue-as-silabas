# Ligue as Sílabas

Jogo web educacional de alfabetização em português (Brasil) para crianças de 5 a 7 anos.
Sílabas caem em bolhas na tela e a criança toca nelas na ordem certa para formar a
palavra mostrada na figura. Tudo é comunicado por imagem, som e animação — sem texto
instrucional, pois o jogador ainda não sabe ler.

## Stack

- [Phaser 3](https://phaser.io/) — motor do jogo
- [Vite](https://vitejs.dev/) — servidor de desenvolvimento e build
- JavaScript puro (vanilla)
- Mobile-first: controle por toque simples (clique no desktop)

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org/) instalado.

```bash
# 1. Instalar as dependências (só na primeira vez)
npm install

# 2. Rodar o jogo em modo de desenvolvimento
npm run dev
```

Depois abra no navegador o endereço que aparecer no terminal (normalmente
`http://localhost:5173`).

## Outros comandos

```bash
npm run dev:celular  # roda liberando acesso pela rede Wi-Fi (teste no celular)
npm run build        # gera a versão final na pasta dist/
npm run preview      # testa localmente a versão final gerada
npm run gerar-audio  # gera os áudios narrados que estiverem faltando
```

## Figuras das palavras

Coloque PNGs 512×512 com fundo transparente em `public/assets/figuras/`,
com o nome `figura_<palavra>.png` (minúsculas, sem acento — ex.:
`figura_bola.png`). A lista completa dos 40 arquivos está em
[public/assets/figuras/LISTA.md](public/assets/figuras/LISTA.md).
Não precisa mexer em código: o jogo detecta os arquivos sozinho ao
recarregar a página. Palavra sem figura mostra o nome escrito (reserva).

## Adicionando ou trocando palavras

1. Edite `src/data/palavras.json`. Cada palavra tem: o texto em caixa alta,
   as sílabas na ordem e as sílabas-distração. Cada fase tem número,
   velocidade de queda (`multiplicadorVelocidade`) e quantidade de
   distratores.
2. Para sílabas novas, adicione também a pronúncia em
   `src/data/pronuncias.json`. Esse arquivo diz ao gerador COMO FALAR cada
   sílaba (ex.: `"PA": "pá"`, `"NE": "nê"`) — sem ele a voz pode expandir
   PA como "para" ou soletrar NE. O que aparece na tela continua vindo de
   `palavras.json`; o mapa afeta só o som. O padrão do projeto: sílaba
   isolada e tônica, com E e O fechados (ê/ô).
3. Rode `npm run gerar-audio`. O script lê os dois JSON e cria em
   `public/assets/audio/` um MP3 por palavra (`palavra_bola.mp3`) e um por
   sílaba única (`silaba_bo.mp3`), com voz neural PT-BR (Francisca) em
   ritmo mais lento, próprio para alfabetização. Áudios que já existem são
   pulados — para regravar um, apague o MP3 correspondente e rode de novo.
   Precisa de internet (a voz vem do serviço do Microsoft Edge).
4. Para conferir o resultado de ouvido, rode `npm run dev` e abra
   `http://localhost:5173/audit.html`: a página lista todas as sílabas com
   botão de play em cada uma e um botão "tocar todas em sequência".

## Estrutura de pastas

```
├── index.html          # página que carrega o jogo
├── public/
│   └── assets/
│       └── audio/      # áudios narrados (gerados por npm run gerar-audio)
├── scripts/
│   └── gerar-audio.mjs # gerador de áudio TTS (lê palavras.json)
└── src/
    ├── main.js         # configuração do Phaser (ponto de entrada)
    ├── scenes/         # cenas do jogo (Boot, Selecao, Game)
    └── data/
        └── palavras.json  # 10 fases, palavras, sílabas e distratores
```

## Documentação

- [GDD — Game Design Document](GDD_LIGUE_AS_SILABAS_v1.md)
