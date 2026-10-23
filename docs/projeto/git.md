# Regras de Git

## Formato da mensagem

```
Kurio - <o que foi feito, em português, começando com substantivo>
```

Exemplos:

- `Kurio - Criação da página inicial e seção de destaque`
- `Kurio - Implementação do catálogo e filtros de NFTs`
- `Kurio - Criação da página de detalhes do NFT`
- `Kurio - Implementação do carrinho e resumo da compra`
- `Kurio - Refatoração dos componentes da interface`
- `Kurio - Ajustes de layout e responsividade`
- `Kurio - Implementação da navegação e do rodapé`

Regras do texto:

- Uma linha só, até ~72 caracteres, sem ponto final.
- Começa com o tipo da mudança: **Criação**, **Implementação**, **Refatoração**, **Ajustes**, **Correção**, **Configuração**, **Testes**, **Documentação**.
- Descreve o resultado ("Implementação do carrinho"), não o processo ("mexi em uns arquivos").
- Se precisar detalhar, use o corpo do commit (linha em branco + tópicos curtos).

## Quando commitar

Commits **medianos**: um commit por bloco significativo, que dá pra descrever numa frase.

- **Sim:** uma tela pronta, uma feature funcionando, uma refatoração completa, a configuração de uma ferramenta, um conjunto de testes.
- **Não:** ajuste de um texto, troca de uma cor, um arquivo isolado, "salvar progresso". Isso entra no próximo commit significativo.
- Regra prática: em geral, **uma tarefa do arquivo da fase = um commit** (ex.: 1.2 Tema, 1.7 Início).

## Antes de commitar (obrigatório)

1. `npm run typecheck`, `npm run lint` e `npm run build` passam.
2. Nada de arquivo indesejado: `node_modules`, `dist`, `.env`, `EscopoDesafioVaga.md`.
3. Marcar o checkbox da tarefa e adicionar a linha no **Registro** da fase, no mesmo commit.

## Push

- Depois de cada commit significativo: `git push`.
- Branch única: `main`.
- **Nunca** `git push --force`, `git reset --hard` ou reescrever histórico já enviado.
- Se o push falhar, parar e avisar. Não tentar contornar.
