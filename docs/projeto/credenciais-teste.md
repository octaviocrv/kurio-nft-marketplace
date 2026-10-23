# Credenciais para testes

Usuários fictícios da API simulada. Use apenas no desenvolvimento e na homologação do Kurio.

| Perfil | Login | Senha | Estado inicial |
| --- | --- | --- | --- |
| Nova Sato | `nova@kurio.dev` | `kurio123` | Carteira principal e secundária |
| Theo Martins | `theo@kurio.dev` | `kurio123` | Somente carteira principal |

## Fluxos úteis

- Rota privada sem login: abra `/checkout`, `/favoritos`, `/pedido/ord-1001` ou `/conta/perfil`.
- Retorno ao fluxo: abra `/checkout?etapa=revisao` sem login e autentique; o app deve voltar para a revisão.
- Sessão expirada: use `?scenario=session-expired` ou escolha **Sessão expirada** no painel de simulação.
- Troca de usuário: saia da conta da Nova e entre como Theo; nenhum dado privado em cache da Nova deve permanecer.
- Estado inicial: use **Restaurar dados iniciais** no painel para remover sessões e cadastros criados durante os testes.

As senhas das fixtures não ficam armazenadas em texto puro no banco simulado; apenas hash SHA-256 com salt.
