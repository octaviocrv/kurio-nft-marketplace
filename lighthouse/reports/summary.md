# Lighthouse — mediana de 3 medições

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Abaixo da meta aparece com ⚠️.

| Perfil | Página | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| mobile | inicio | **77** ⚠️ | 100 | 100 | 100 | 4.76 s | 0.021 | 148 ms |
| mobile | detalhe | **75** ⚠️ | 100 | 100 | 100 | 5.02 s | 0.000 | 208 ms |
| desktop | inicio | 98 | 100 | 100 | 100 | 1.12 s | 0.000 | 0 ms |
| desktop | detalhe | 97 | 100 | 100 | 100 | 1.24 s | 0.033 | 0 ms |

## Ambiente e condições

- Data: 2026-10-24T18:34:31.815Z
- Lighthouse 13.5.0
- Navegador: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36
- Node v24.20.0 · Windows_NT 10.0.26200 (x64)
- CPU: AMD Ryzen 7 5700G with Radeon Graphics          × 16 · 15 GB de RAM · benchmarkIndex 2875
- Condições: vite preview do build de produção, mocks ligados no cenário padrão, Chrome headless com perfil novo a cada medição
- Perfis: mobile = padrão do Lighthouse (celular emulado, 4G lento, CPU 4x, throttling simulado); desktop = `--preset=desktop`

## Todas as medições

| Perfil | Página | Medição | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| mobile | inicio | 1 | 77 | 100 | 100 | 100 | 4.75 s | 0.021 | 146 ms |
| mobile | inicio | 2 | 76 | 100 | 100 | 100 | 4.76 s | 0.021 | 150 ms |
| mobile | inicio | 3 | 77 | 100 | 100 | 100 | 4.77 s | 0.021 | 148 ms |
| mobile | detalhe | 1 | 75 | 100 | 100 | 100 | 5.02 s | 0.000 | 181 ms |
| mobile | detalhe | 2 | 75 | 100 | 100 | 100 | 4.82 s | 0.000 | 212 ms |
| mobile | detalhe | 3 | 74 | 100 | 100 | 100 | 5.06 s | 0.000 | 208 ms |
| desktop | inicio | 1 | 98 | 100 | 100 | 100 | 1.13 s | 0.000 | 0 ms |
| desktop | inicio | 2 | 98 | 100 | 100 | 100 | 1.12 s | 0.000 | 0 ms |
| desktop | inicio | 3 | 98 | 100 | 100 | 100 | 1.08 s | 0.000 | 2 ms |
| desktop | detalhe | 1 | 97 | 100 | 100 | 100 | 1.24 s | 0.036 | 1 ms |
| desktop | detalhe | 2 | 96 | 100 | 100 | 100 | 1.31 s | 0.032 | 0 ms |
| desktop | detalhe | 3 | 97 | 100 | 100 | 100 | 1.17 s | 0.033 | 0 ms |

Relatórios completos: `<perfil>-<página>-<medição>.report.html` e `.report.json` nesta pasta.
