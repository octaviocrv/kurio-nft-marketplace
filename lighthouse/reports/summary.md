# Lighthouse — mediana de 3 medições

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Abaixo da meta aparece com ⚠️.

| Perfil | Página | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| mobile | inicio | **70** ⚠️ | 100 | 100 | 100 | 5.15 s | 0.021 | 443 ms |
| mobile | detalhe | **73** ⚠️ | 100 | 100 | 100 | 4.89 s | 0.000 | 389 ms |
| desktop | inicio | 96 | 100 | 100 | 100 | 1.40 s | 0.000 | 19 ms |
| desktop | detalhe | 97 | 100 | 100 | 100 | 1.30 s | 0.032 | 3 ms |

## Ambiente e condições

- Data: 2026-10-24T15:04:03.068Z
- Lighthouse 13.5.0
- Navegador: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36
- Node v22.23.4 · Linux 6.18.44-fc-v153 (x64)
- CPU: Intel(R) Xeon(R) Processor @ 2.10GHz × 2 · 8 GB de RAM · benchmarkIndex 2321.5
- Condições: vite preview do build de produção, mocks ligados no cenário padrão, Chrome headless com perfil novo a cada medição
- Perfis: mobile = padrão do Lighthouse (celular emulado, 4G lento, CPU 4x, throttling simulado); desktop = `--preset=desktop`

## Todas as medições

| Perfil | Página | Medição | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| mobile | inicio | 1 | 67 | 100 | 100 | 100 | 5.24 s | 0.021 | 515 ms |
| mobile | inicio | 2 | 70 | 100 | 100 | 100 | 5.04 s | 0.021 | 443 ms |
| mobile | inicio | 3 | 70 | 100 | 100 | 100 | 5.15 s | 0.021 | 419 ms |
| mobile | detalhe | 1 | 68 | 100 | 100 | 100 | 5.02 s | 0.000 | 509 ms |
| mobile | detalhe | 2 | 73 | 100 | 100 | 100 | 4.88 s | 0.000 | 389 ms |
| mobile | detalhe | 3 | 75 | 100 | 100 | 100 | 4.89 s | 0.000 | 301 ms |
| desktop | inicio | 1 | 94 | 100 | 100 | 100 | 1.58 s | 0.000 | 26 ms |
| desktop | inicio | 2 | 97 | 100 | 100 | 100 | 1.26 s | 0.000 | 13 ms |
| desktop | inicio | 3 | 96 | 100 | 100 | 100 | 1.40 s | 0.000 | 19 ms |
| desktop | detalhe | 1 | 96 | 100 | 100 | 100 | 1.45 s | 0.032 | 36 ms |
| desktop | detalhe | 2 | 97 | 100 | 100 | 100 | 1.30 s | 0.032 | 3 ms |
| desktop | detalhe | 3 | 97 | 100 | 100 | 100 | 1.30 s | 0.032 | 3 ms |

Relatórios completos: `<perfil>-<página>-<medição>.report.html` e `.report.json` nesta pasta.
