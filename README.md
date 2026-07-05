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
npm run build     # gera a versão final na pasta dist/
npm run preview   # testa localmente a versão final gerada
```

## Estrutura de pastas

```
├── index.html          # página que carrega o jogo
├── public/
│   └── assets/         # imagens e áudios do jogo
└── src/
    ├── main.js         # configuração do Phaser (ponto de entrada)
    ├── scenes/         # cenas do jogo (Boot, Menu, Jogo, FimDeFase)
    └── data/           # conteúdo editável (futuro palavras.json)
```

## Documentação

- [GDD — Game Design Document](GDD_LIGUE_AS_SILABAS_v1.md)
