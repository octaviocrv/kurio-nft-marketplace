// Roda a regressão visual no Docker oficial do Playwright (mesma versão do pacote), para a
// renderização ser idêntica em qualquer máquina. Uso: `npm run test:visual` (compara) ou
// `npm run test:visual:update` (regrava as baselines).
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// `docker info` falha tanto sem Docker instalado quanto com o Docker fechado
if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
  console.error('Docker não está disponível. Instale ou abra o Docker Desktop para rodar a regressão visual.')
  console.error('Os demais comandos (test:e2e, build, lint) não precisam de Docker.')
  process.exit(1)
}

const { version } = JSON.parse(readFileSync('node_modules/@playwright/test/package.json', 'utf8'))
const image = `mcr.microsoft.com/playwright:v${version}-noble`
const extraArgs = process.argv.slice(2).join(' ')

// O projeto é montado em /app, mas node_modules fica num volume anônimo: o `npm ci` do container
// instala os binários do Linux sem tocar nos node_modules do Windows/macOS.
const command = `npm ci --no-audit --no-fund --loglevel=error && npx playwright test --project=visual ${extraArgs}`
const result = spawnSync(
  'docker',
  ['run', '--rm', '--ipc=host', '-v', `${process.cwd()}:/app`, '-v', '/app/node_modules', '-w', '/app', image, 'sh', '-c', command],
  { stdio: 'inherit' },
)
process.exit(result.status ?? 1)
