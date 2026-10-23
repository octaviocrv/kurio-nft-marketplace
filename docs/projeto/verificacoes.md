# Verificações (o que rodar e quando)

Regra geral: **rodar só o necessário, no momento certo.** Nada de rodar teste "pra ver se funciona" a cada mudança, nem repetir o mesmo comando em loop.

| Verificação | Comando | Quando | Por quê |
| --- | --- | --- | --- |
| Tipos | `npm run typecheck` | Ao fim de cada tarefa (antes do commit) | Rápido; pega erro de tipo e contrato quebrado |
| Lint | `npm run lint` | Ao fim de cada tarefa (antes do commit) | Pega bug de hooks, import e variável sobrando |
| Build | `npm run build` | Ao fim de cada tarefa (antes do commit) | Garante que o deploy não vai quebrar |
| Playwright | `npx playwright test <arquivo>` | Fase 2 em diante: só o arquivo de teste da feature que mudou | Suíte inteira é lenta |
| Playwright completo | `npm run test:e2e` | Só antes do deploy ou quando o Octavio pedir | |
| Lighthouse | `npm run lighthouse` | Só na fase 3 | |

## O que a IA **não** faz

- Não roda `npm run dev`, não abre navegador e não tira screenshot. **Quem valida o visual é o Octavio**, com o dev server aberto.
- Não cria teste unitário. O enunciado exige só E2E com Playwright.
- Não roda verificação no meio da tarefa, a não ser que um erro precise ser investigado.
- Se uma verificação falhar duas vezes seguidas pelo mesmo motivo, **para e explica** o erro em vez de seguir tentando.
