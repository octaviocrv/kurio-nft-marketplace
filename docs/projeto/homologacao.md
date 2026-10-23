# Homologação (quem valida o quê)

| Quem | Valida |
| --- | --- |
| **IA** | O que é algorítmico: tipos, lint, build, contratos, lógica de dados (ETH, idempotência, eventos), configuração de pacotes. E escreve os testes Playwright exigidos no enunciado (fase 2 em diante). |
| **Octavio** | O que se vê e se usa: fidelidade ao Figma, responsividade, navegação, comportamento das telas e fluxos. É quem aprova cada tarefa. |

## Ciclo de cada tarefa

1. **IA implementa** a tarefa e roda as verificações de fim de tarefa (`verificacoes.md`).
2. **IA avisa** "Pronto pra homologar: <tarefa>". Sem roteiro nem checklist.
   - Exceção: só informa o que **não dá pra descobrir olhando** a tela (ex.: cenário de falha por URL, credenciais de teste). Uma linha, no máximo.
3. **Octavio homologa** com `npm run dev` aberto e reporta os problemas.
4. **IA corrige** e devolve só o que mudou. Repete até aprovar.
5. Octavio diz **"aprovado"** → **IA faz o commit** → **Octavio faz o push**.

Bloco **só de lógica/infra** (sem mudança na tela): a IA testa tudo (inclusive com scripts descartáveis contra o MSW) e reporta o resultado; o Octavio só aprova.

A IA **não commita antes da aprovação** e **não faz verificação visual** (abrir navegador, screenshot, checar layout). Isso é papel do Octavio.

## Como reportar um problema

Um por linha, no formato:

```
<tela> — <o que está errado> — <como deveria ser (se souber)>
```

Exemplo: `Carrinho — total cortado em 390px — deveria quebrar linha como no Figma`.
Print ajuda, mas não é obrigatório.

## Dicas para homologar

- Dev server: `npm run dev` (deixa rodando; o Vite atualiza sozinho a cada mudança).
- Modo mobile no Chrome: **F12 → Ctrl+Shift+M** → largura **390**. Na fase 3, testar também 768 e 1440.
- Compare lado a lado com o PNG correspondente em `docs/figma/`.
- A partir da fase 2: cenários de falha por URL (ex.: `?scenario=slow`). A lista entra no roteiro de cada tarefa.
