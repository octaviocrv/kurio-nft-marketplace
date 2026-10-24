# Lighthouse — mediana de 3 medições

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Abaixo da meta aparece com ⚠️.

| Perfil | Página | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| mobile | inicio | **71** ⚠️ | 100 | 100 | 100 | 4.93 s | 0.021 | 450 ms |
| mobile | detalhe | **78** ⚠️ | 100 | 100 | 100 | 4.57 s | 0.000 | 284 ms |
| desktop | inicio | 91 | 100 | 100 | 100 | 1.97 s | 0.000 | 16 ms |
| desktop | detalhe | 95 | 100 | 100 | 100 | 1.51 s | 0.032 | 0 ms |

## Ambiente e condições

- Data: 2026-10-24T04:43:20.587Z
- Lighthouse 13.5.0
- Navegador: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36
- Node v22.23.4 · Linux 6.18.44-fc-v153 (x64)
- CPU: Intel(R) Xeon(R) Processor @ 2.10GHz × 2 · 8 GB de RAM · benchmarkIndex 2125
- Condições: vite preview do build de produção, mocks ligados no cenário padrão, Chrome headless com perfil novo a cada medição
- Perfis: mobile = padrão do Lighthouse (celular emulado, 4G lento, CPU 4x, throttling simulado); desktop = `--preset=desktop`

## Todas as medições

| Perfil | Página | Medição | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| mobile | inicio | 1 | 71 | 100 | 100 | 100 | 4.93 s | 0.021 | 450 ms |
| mobile | inicio | 2 | 64 | 100 | 100 | 100 | 5.49 s | 0.021 | 636 ms |
| mobile | inicio | 3 | 75 | 100 | 100 | 100 | 4.85 s | 0.021 | 326 ms |
| mobile | detalhe | 1 | 76 | 100 | 100 | 100 | 4.58 s | 0.000 | 326 ms |
| mobile | detalhe | 2 | 80 | 100 | 100 | 100 | 4.57 s | 0.000 | 219 ms |
| mobile | detalhe | 3 | 78 | 100 | 100 | 100 | 4.55 s | 0.000 | 284 ms |
| desktop | inicio | 1 | 93 | 100 | 100 | 100 | 1.71 s | 0.000 | 5 ms |
| desktop | inicio | 2 | 91 | 100 | 100 | 100 | 1.97 s | 0.000 | 25 ms |
| desktop | inicio | 3 | 90 | 100 | 100 | 100 | 2.01 s | 0.000 | 16 ms |
| desktop | detalhe | 1 | 95 | 100 | 100 | 100 | 1.54 s | 0.032 | 0 ms |
| desktop | detalhe | 2 | 95 | 100 | 100 | 100 | 1.51 s | 0.032 | 0 ms |
| desktop | detalhe | 3 | 95 | 100 | 100 | 100 | 1.48 s | 0.032 | 9 ms |

Relatórios completos: `<perfil>-<página>-<medição>.report.html` e `.report.json` nesta pasta.
