// Configuração versionada da auditoria Lighthouse (enunciado §10). Lida por scripts/lighthouse.mjs.
export default {
  // Três medições por página e perfil; o relatório usa a mediana de cada categoria e métrica
  runs: 3,
  // Porta do `vite preview` (build otimizado, cenário padrão dos mocks)
  port: 4173,
  pages: [
    { name: 'inicio', path: '/' },
    { name: 'detalhe', path: '/nft/emerald-ape-042' },
  ],
  profiles: [
    // Padrão do Lighthouse: celular emulado, rede 4G lenta e CPU 4x mais lenta (throttling simulado)
    { name: 'mobile', flags: [] },
    // Preset oficial de desktop: tela 1350×940, rede rápida e sem desaceleração de CPU
    { name: 'desktop', flags: ['--preset=desktop'] },
  ],
  categories: ['performance', 'accessibility', 'best-practices', 'seo'],
  // Metas do enunciado (0–100)
  targets: { performance: 90, accessibility: 95, 'best-practices': 95, seo: 90 },
}
