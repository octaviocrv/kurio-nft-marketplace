# Desafio Jungle Gaming — NFT Marketplace

Este arquivo é só o **índice**. O conteúdo fica em `docs/`.

## Sempre carregado

- Enunciado: @EscopoDesafioVaga.md (fica só na máquina local, está no `.gitignore`)
- Arquitetura (pastas, camadas, estado, design system, libs): @docs/projeto/arquitetura.md
- Decisões técnicas e desvios do Figma: @docs/projeto/decisoes.md
- Regras de Git (formato do commit, quando commitar): @docs/projeto/git.md
- Verificações (o que rodar e quando): @docs/projeto/verificacoes.md
- Homologação (ciclo de cada tarefa, quem valida o quê): @docs/projeto/homologacao.md

## Consultar quando precisar

- Figma: `docs/figma/` (PNG de cada frame + `tokens.md` com cores e tipografia)
- Fases (objetivo, tarefas, critério de pronto e registro do que foi feito):
  - `docs/fases/fase-1-mobile-visual.md`
  - `docs/fases/fase-2-funcionalidade.md`
  - `docs/fases/fase-3-desktop-acabamento.md`

**Antes de qualquer tarefa, leia o arquivo da fase atual.** Toda tarefa segue o ciclo de `homologacao.md`: implementar → verificar → "pronto pra homologar" → correções → aprovação do Octavio → commit (checkbox + Registro no mesmo commit).

**Fase atual: 1 — Mobile visual**

## Regras de trabalho

- Siga o escopo à risca. Não invente feature fora do enunciado.
- Código simples, legível e com nomes claros. Nada de abstração "pra parecer sofisticado".
- Comentários curtos **só nos pontos de decisão** (por quê, não o quê).
- Não adicione dependência fora da lista em `arquitetura.md` sem explicar por quê.
- Mudanças pequenas e focadas. O projeto compila e roda ao final de cada passo.
- Commits seguem `docs/projeto/git.md`. **A IA nunca faz push.**
- Verificações seguem `docs/projeto/verificacoes.md`. Não rode teste sem necessidade.
- Ambiente: Windows + PowerShell, npm.
- O `README.md` e o `docs/ARCHITECTURE.md` são entregáveis para o avaliador; os arquivos de `docs/projeto` e `docs/fases` são as nossas anotações de trabalho.
