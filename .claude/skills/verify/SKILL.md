---
name: verify
description: Como verificar o jogo Ligue as Sílabas rodando de verdade no navegador
---

# Verificação do Ligue as Sílabas

Jogo Phaser 3 em canvas — a superfície é o navegador. Não basta `npm run build`.

## Receita

1. `npm run dev` em background (porta 5173).
2. Automação com `playwright-core` (instalar no scratchpad, NÃO no projeto) usando
   `chromium.launch({ channel: 'msedge' })` — usa o Edge do Windows, sem download
   de navegador. Viewport de celular: 412×915.
3. A instância do Phaser está exposta em `window.game` (ver src/main.js).
   Estado da cena de jogo: `window.game.scene.getScene('Game')` →
   `.dados` (palavra atual), `.proximaSilaba`, `.bolhas[]` (cada uma com
   `.silaba`, `.x/.y`, `.capturada`).
4. Coordenadas do jogo (base 720×1280, Scale.FIT) → página:
   `pagina = rect.left + (gx / 720) * rect.width` usando o boundingRect do canvas.
5. Clicar com `page.mouse.click()` nas coordenadas convertidas — clique real,
   não chamar métodos da cena.
6. Capturar `console` type=error e `pageerror` — critério do projeto é console limpo.

## Áudio (S4+)

- Boot pré-carrega todos os MP3 de `public/assets/audio/` e vai para a cena
  `Selecao` (10 botões). O clique num botão é o gesto que desbloqueia o áudio.
- Lançar o navegador com `--autoplay-policy=no-user-gesture-required` para
  testes headless.
- Conferir reprodução com `window.game.sound.getAllPlaying().map(s => s.key)`
  logo após a ação (palavra ~1s falada; polling de 150ms funciona).
- Config por fase: `scene.numeroFase`, `scene.velocidadeQueda`
  (fases 9-10 = 103,5), `scene.bolhas.length` (2 síl + 4 distratores = 6).

## Auditoria de áudio

- `/audit.html` (só no dev server) lista as sílabas com play individual e
  em sequência. O texto FALADO vem de `src/data/pronuncias.json`
  (sílaba exibida ≠ texto enviado ao TTS).
- Checagem automatizada útil: medir `Audio().duration` de todas as sílabas —
  pronúncia expandida/soletrada aparece como outlier (>1,5x a média).
- Favicon: os 404 de favicon aparecem no console mas NÃO nos eventos de
  response do Playwright (o Chromium busca favicon fora do fluxo da página).
  Toda página HTML nova precisa do favicon em data URI.

## Fluxos que valem dirigir

- Clicar bolha errada / fora de ordem → `proximaSilaba` não muda, bolha balança e segue.
- Jogar as 5 palavras em ordem → slots preenchem, celebração, próxima palavra.
- Fim da 5ª palavra → texto "FASE COMPLETA!" e reinício na 1ª palavra.

## Pegadinhas

- Boot demora 1,2s antes de entrar na cena Game — esperar ~2,2s após goto.
- Bolhas nascem escalonadas acima da tela; a bolha desejada pode levar ~10s
  para ficar visível. Fazer polling com timeout generoso.
- Após cada palavra, aguardar ~2,6s (celebração de 1,5s + tween) antes de ler
  a próxima palavra.
