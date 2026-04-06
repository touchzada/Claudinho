/**
 * Modo Camaleao — instrucoes de seguranca para commits em repos publicos/opensource.
 *
 * Diferente do Undercover (que protege contra vazamento de codenames internos da
 * Anthropic), o Camaleao protege contra qualquer rastro de que o commit veio de IA.
 *
 * Ativacao:
 *   - CLAUDINHO_CAMALEAO=1 — forca ON
 *   - CLAUDINHO_CAMALEAO=0 — forca OFF
 *   - AUTO: detecta se o repo e publico (remote nao e privado) e sugere usar
 *
 * Quando ativo, o modelo recebe instrucoes para:
 *   - Nao mencionar que foi gerado por IA
 *   - Escrever mensagens de commit como um dev humano
 *   - Nao incluir linhas Co-Authored-By ou atribuicao automatica
 *   - Nao revelar o modelo/provedor utilizado
 */

import { execFileNoThrowWithCwd } from './execFileNoThrow.js'
import { findGitRoot } from './git.js'
import { getCwd } from './cwd.js'
import { isEnvTruthy } from './envUtils.js'
import { getGlobalConfig } from './config.js'

/**
 * Retorna o remote URL do repo atual ou null se nao for repo git.
 */
async function getRemoteUrl(): Promise<string | null> {
  try {
    const cwd = findGitRoot(getCwd())
    if (!cwd) return null
    const result = await execFileNoThrowWithCwd(
      'git',
      ['remote', 'get-url', 'origin'],
      { cwd, timeout: 5000 },
    )
    if (result.code === 0 && result.stdout) {
      return result.stdout.trim()
    }
  } catch {
    // Nao e repo git ou git nao disponivel
  }
  return null
}

/**
 * Lista de dominios que indicam repos privados/privilegiados.
 * Se o remote casar com algum desses, o Camaleao fica OFF por default.
 */
const PRIVATE_REPO_DOMAINS = [
  'github.com:anthropics/',
  'github.com/anthropics/',
]

/**
 * Verifica se o modo Camaleao esta ativo.
 *
 * Regra de decisao:
 *  1. CLAUDINHO_CAMALEAO=1 → ON (forca)
 *  2. CLAUDINHO_CAMALEAO=0 → OFF (forca)
 *  3. AUTO: ON a menos que o remote seja de um repo privado conhecido
 */
export async function isCamaleao(): Promise<boolean> {
  // Forcado via env?
  if (process.env.CLAUDINHO_CAMALEAO !== undefined) {
    return isEnvTruthy(process.env.CLAUDINHO_CAMALEAO)
  }

  // Checagem via config global
  const config = getGlobalConfig()
  if (config.camaleaoMode === false) return false
  if (config.camaleaoMode === true) return true

  // Auto: ON a menos que repo seja privado conhecido
  const remote = await getRemoteUrl()
  if (remote) {
    const isPrivate = PRIVATE_REPO_DOMAINS.some(domain =>
      remote.includes(domain),
    )
    return !isPrivate
  }

  // Sem remote (repo local) → ON por seguranca
  return true
}

/**
 * Versao sincrona que usa cache. Retorna true se o Camaleao deve estar ativo.
 * O cache e preenchido na primeira chamada async.
 */
let camaleaoCache: boolean | null = null

export function isCamaleaoCached(): boolean {
  if (camaleaoCache !== null) return camaleaoCache
  // Safe default: se o remote e privado, OFF; senao ON
  const remote = process.env.CLAUDINHO_CAMALEAO_REMOTE || ''
  if (remote) {
    const isPrivate = PRIVATE_REPO_DOMAINS.some(domain =>
      remote.includes(domain),
    )
    camaleaoCache = !isPrivate
    return camaleaoCache
  }
  // Sem info → ON por seguranca
  return true
}

/**
 * Popula o cache sincrono a partir do resultado async.
 */
export function setCamaleaoCache(value: boolean) {
  camaleaoCache = value
}

/**
 * Retorna as instrucoes de camuflagem para o modelo.
 */
export function getCamaleaoInstructions(): string {
  return `## MODO CAMALEAO — ATIVADO

Voce esta operando num repositorio PUBLICO/OPEN-SOURCE. Suas mensagens de
commit, titulos de PR e descricoes DEVEM parecer escritas por um desenvolvedor
humano.

REGRAS CRITICAS:

NUNCA inclua em mensagens de commit ou PRs:
- Mencao a IAs, modelos de linguagem, ou ferramentas de automacao
- "Gerado por Claude", "AI-assisted", "copilot", ou similares
- Linhas Co-Authored-By ou qualquer atribuicao automatica
- Links para repositorios do Claudinho/OpenClaude
- Mencao ao provedor ou modelo utilizado
- Comentarios sobre como o codigo foi gerado

Escreva mensagens de commit COMO UM DEV HUMANO:
- Descreva APENAS o que a mudanca faz e por que
- Use conventional commits quando apropriado (fix, feat, docs, refactor, test, chore)
- Seja conciso e objetivo
- Foque no "por que" ao inves do "como"

BOM:
- "fix: race condition na inicializacao do file watcher"
- "feat: adicionar suporte para custom key bindings"
- "refactor: parser para melhorar mensagens de erro"

RUIM (nunca escreva):
- "fix encontrado pelo Claudinho usando Claude Sonnet"
- "codigo gerado pelo Claudinho em 3 prompts"
- "Co-Authored-By: Claudinho AI <noreply@example.com>"
- "feat: implementado com ajuda do Claudinho + GPT-4o"
`
}

/**
 * Versao limpa (sem prefixo decorado) para uso inline.
 */
export function getCamaleaoInstructionsInline(): string {
  return `MODO CAMALEAO: Escreva mensagens de commit/PR como um dev humano. Nunca mencione IA, modelos, ferramentas de automacao, ou incluia Co-Authored-By/atribuicao. Descreva apenas o que o codigo faz e por que.`
}

