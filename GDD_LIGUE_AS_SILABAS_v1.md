# GDD — Ligue as Sílabas (v1)
> Segmento 1 do projeto | Status: AGUARDANDO APROOVAÇÃO
> Sócio-diretor: Cesar | Execução técnica: Claude Code
> Backlog futuro: "Caixa Rápido" (troco em Real), "Missão Reciclagem" (sorting)

---

## 1. Visão em uma frase
Jogo web de alfabetização em que sílabas caem suavemente na tela e a criança as toca na ordem certa para formar a palavra da figura mostrada.

## 2. Público e objetivo pedagógico
- **Idade:** 5 a 7 anos (fase de alfabetização)
- **BNCC:** consciência fonológica e formação de palavras (EF01LP05, EF01LP06, EF01LP08)
- **Premissa de design:** o jogador NÃO sabe ler instruções. Tudo é comunicado por imagem, som e animação. Zero texto instrucional.

## 3. Loop de gameplay (o coração)
1. Uma **figura** aparece no topo (ex: desenho de uma BOLA) e o narrador **fala a palavra** em voz alta ("BOLA!")
2. Sílabas descem flutuando devagar, em bolhas: **BO**, **LA** + 2-3 sílabas-distração (**CA**, **PO**)
3. A criança **toca as sílabas na ordem correta**; cada toque acerto: a sílaba voa para os espaços vazios sob a figura, com som da sílaba falada ("BO!")
4. Sílaba errada: a bolha balança e quica pra fora (som suave, sem punição agressiva)
5. Palavra completa: celebração (confete + palavra inteira falada + estrela)
6. 5 palavras completas = fase concluída → tela de estrelas

**Sem game over.** Errar nunca encerra o jogo — na alfabetização, frustração é inimiga. A "pontuação" são estrelas (1-3 por fase, baseadas em acertos de primeira).

## 4. Progressão (10 fases no v1)
| Fases | Família silábica | Exemplos de palavras |
|---|---|---|
| 1-2 | Palavras de 2 sílabas simples (CV+CV) | BOLA, SAPO, GATO, PATO, MALA |
| 3-4 | 2 sílabas, novas famílias | CASA, DEDO, FOGO, LUA*, PIPA |
| 5-6 | 3 sílabas simples | SAPATO, BONECA, CAVALO, PANELA |
| 7-8 | Mistas 2-3 sílabas, mais distratores | TOMATE, JANELA, MENINO |
| 9-10 | Velocidade levemente maior + 4 distratores | revisão geral |

*Banco de palavras em JSON editável — você adiciona/troca palavras sem tocar em código.*

## 5. Controles
- **Mobile/tablet (primário):** toque
- **Desktop:** clique
- Nada de teclado, nada de arrastar (toque simples = motor fino de 5 anos)

## 6. Direção de arte e som
- **Visual:** cores vivas, formas arredondadas, alto contraste; bolhas translúcidas para as sílabas; fundo cenário natureza suave (céu, campo) que muda de cor por fase
- **Fonte:** caixa alta, tipografia de alfabetização (sem serifa, letras "escolares" — ex: fonte aberta tipo Andika/Atkinson)
- **Assets v1:** Kenney + itch.io gratuitos para UI e cenário; figuras das palavras geradas por IA em estilo flat consistente (seu toolkit atual) e otimizadas
- **Áudio (crítico neste jogo):** narração das palavras e sílabas em PT-BR — v1 com voz TTS de qualidade (ex: TTS neural) gerada uma vez e salva como arquivos .mp3; efeitos no jfxr; música de fundo calma e opcional (botão mudo grande)

## 7. Stack e arquitetura
- **Phaser 3 + Vite + GitHub (deploy via GitHub Pages)**
- Estrutura: `palavras.json` (conteúdo) separado de `src/` (lógica) e `assets/` (mídia)
- Cenas Phaser: Boot → Menu → Jogo → FimDeFase
- Responsivo: mobile-first, funciona em qualquer tela

## 8. Telas (v1 completo = 4 telas)
1. **Menu:** logo + botão gigante JOGAR (ícone play) + botão som
2. **Seleção de fase:** trilha de 10 botões com estrelas conquistadas
3. **Jogo:** o loop
4. **Fim de fase:** estrelas + botões repetir/próxima

Progresso salvo no navegador (localStorage) — sem login, sem backend.

## 9. Fora de escopo do v1 (anotado para não escapar)
Sílabas complexas (CH, LH, NH, encontros consonantais), modo multiplayer, contas/login, placar online, versão em app nativo, painel do professor. Tudo isso é v2+.

## 10. Métricas de sucesso do v1
- Link público jogável em celular
- Sessão de teste com 1-2 crianças reais da faixa etária (observar: entendem sem explicação?)
- Peça de portfólio publicada (post LinkedIn documentando o processo AI Builder)

## 11. Roadmap de segmentos (relembrando)
- **S1** ✅ este documento (após sua aprovação)
- **S2** Setup: repo + Vite + Phaser rodando
- **S3** Loop core jogável com placeholders
- **S4** Conteúdo: palavras.json + 10 fases + áudio TTS
- **S5** Arte e som finais
- **S6** Polish + deploy + link público
