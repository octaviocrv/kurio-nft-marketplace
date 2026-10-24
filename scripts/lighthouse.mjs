// Auditoria Lighthouse do enunciado (§10): build otimizado + `vite preview` com os mocks no cenário
// padrão, 3 medições por página e perfil, mediana por categoria e de LCP/CLS/TBT.
// Uso: `npm run lighthouse` (ou `npm run lighthouse -- --skip-build` para reaproveitar o dist/).
// Chrome: usa CHROME_PATH se existir; senão o Chromium do Playwright (`npx playwright install chromium`).
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import config from '../lighthouse/lighthouse.config.mjs'

const reportsDir = 'lighthouse/reports'
const baseUrl = `http://localhost:${config.port}`
const isWindows = process.platform === 'win32'

async function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const { chromium } = await import('@playwright/test')
  return chromium.executablePath()
}

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // servidor ainda subindo
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`O preview não respondeu em ${url}`)
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function runLighthouse(chromePath, url, outputPath, profileFlags) {
  const args = [
    'node_modules/lighthouse/cli/index.js',
    url,
    '--output=json',
    '--output=html',
    `--output-path=${outputPath}`,
    `--only-categories=${config.categories.join(',')}`,
    // Cada execução abre um Chrome com perfil novo: sem cache nem localStorage, logo cenário padrão do mock
    '--chrome-flags=--headless=new --no-sandbox',
    '--quiet',
    ...profileFlags,
  ]
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chromePath } })
  if (result.status !== 0) throw new Error(`Lighthouse falhou em ${url}`)
  return JSON.parse(readFileSync(`${outputPath}.report.json`, 'utf8'))
}

function summarize(lhr) {
  const scores = Object.fromEntries(config.categories.map((id) => [id, Math.round(lhr.categories[id].score * 100)]))
  return {
    scores,
    lcpMs: lhr.audits['largest-contentful-paint'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue,
    tbtMs: lhr.audits['total-blocking-time'].numericValue,
  }
}

async function main() {
  if (!process.argv.includes('--skip-build')) {
    const build = spawnSync(isWindows ? 'npm.cmd' : 'npm', ['run', 'build'], { stdio: 'inherit', shell: isWindows })
    if (build.status !== 0) process.exit(build.status ?? 1)
  }

  const chromePath = await findChrome()
  if (!existsSync(chromePath)) {
    console.error(`Chrome não encontrado em ${chromePath}. Rode \`npx playwright install chromium\` ou defina CHROME_PATH.`)
    process.exit(1)
  }

  rmSync(reportsDir, { recursive: true, force: true })
  mkdirSync(reportsDir, { recursive: true })

  const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(config.port), '--strictPort'], { stdio: 'ignore' })
  const results = []
  let firstLhr
  try {
    await waitForServer(baseUrl)
    for (const profile of config.profiles) {
      for (const page of config.pages) {
        const runs = []
        for (let run = 1; run <= config.runs; run += 1) {
          console.log(`Lighthouse ${profile.name} · ${page.name} · medição ${run}/${config.runs}`)
          const lhr = runLighthouse(chromePath, `${baseUrl}${page.path}`, `${reportsDir}/${profile.name}-${page.name}-${run}`, profile.flags)
          firstLhr ??= lhr
          runs.push(summarize(lhr))
        }
        results.push({
          profile: profile.name,
          page: page.name,
          path: page.path,
          runs,
          median: {
            scores: Object.fromEntries(config.categories.map((id) => [id, median(runs.map((item) => item.scores[id]))])),
            lcpMs: median(runs.map((item) => item.lcpMs)),
            cls: median(runs.map((item) => item.cls)),
            tbtMs: median(runs.map((item) => item.tbtMs)),
          },
        })
      }
    }
  } finally {
    preview.kill()
  }

  const environment = {
    date: new Date().toISOString(),
    lighthouse: firstLhr.lighthouseVersion,
    chrome: firstLhr.environment.hostUserAgent,
    node: process.version,
    os: `${os.type()} ${os.release()} (${os.arch()})`,
    cpu: `${os.cpus()[0]?.model ?? 'desconhecida'} × ${os.cpus().length}`,
    memoryGb: Math.round(os.totalmem() / 1024 ** 3),
    benchmarkIndex: firstLhr.environment.benchmarkIndex,
    conditions: 'vite preview do build de produção, mocks ligados no cenário padrão, Chrome headless com perfil novo a cada medição',
  }
  writeFileSync(`${reportsDir}/summary.json`, `${JSON.stringify({ environment, targets: config.targets, results }, null, 2)}\n`)
  writeFileSync(`${reportsDir}/summary.md`, toMarkdown(environment, results))
  console.log(`\nResumo em ${reportsDir}/summary.md`)
}

function toMarkdown(environment, results) {
  const flag = (id, score) => (score >= config.targets[id] ? `${score}` : `**${score}** ⚠️`)
  const rows = results.map(({ profile, page, median: m }) =>
    `| ${profile} | ${page} | ${config.categories.map((id) => flag(id, m.scores[id])).join(' | ')} | ${(m.lcpMs / 1000).toFixed(2)} s | ${m.cls.toFixed(3)} | ${Math.round(m.tbtMs)} ms |`,
  )
  const runRows = results.flatMap(({ profile, page, runs }) =>
    runs.map((run, index) => `| ${profile} | ${page} | ${index + 1} | ${config.categories.map((id) => run.scores[id]).join(' | ')} | ${(run.lcpMs / 1000).toFixed(2)} s | ${run.cls.toFixed(3)} | ${Math.round(run.tbtMs)} ms |`),
  )
  return `# Lighthouse — mediana de ${config.runs} medições

Metas: Performance ≥ ${config.targets.performance}, Accessibility ≥ ${config.targets.accessibility}, Best Practices ≥ ${config.targets['best-practices']}, SEO ≥ ${config.targets.seo}. Abaixo da meta aparece com ⚠️.

| Perfil | Página | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join('\n')}

## Ambiente e condições

- Data: ${environment.date}
- Lighthouse ${environment.lighthouse}
- Navegador: ${environment.chrome}
- Node ${environment.node} · ${environment.os}
- CPU: ${environment.cpu} · ${environment.memoryGb} GB de RAM · benchmarkIndex ${environment.benchmarkIndex}
- Condições: ${environment.conditions}
- Perfis: mobile = padrão do Lighthouse (celular emulado, 4G lento, CPU 4x, throttling simulado); desktop = \`--preset=desktop\`

## Todas as medições

| Perfil | Página | Medição | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${runRows.join('\n')}

Relatórios completos: \`<perfil>-<página>-<medição>.report.html\` e \`.report.json\` nesta pasta.
`
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
