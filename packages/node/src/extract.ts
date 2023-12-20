import { logger } from '@pandacss/logger'
import type { PandaContext } from './create-context'

export function extractFile(ctx: PandaContext, relativeFile: string) {
  const file = ctx.runtime.path.abs(ctx.config.cwd, relativeFile)
  logger.debug('file:extract', file)

  try {
    const measure = logger.time.debug(`Parsed ${file}`)
    const result = ctx.project.parseSourceFile(file)
    measure()
    return result
  } catch (error) {
    logger.error('file:extract', error)
  }
}
export type CssArtifactType = 'preflight' | 'tokens' | 'static' | 'global' | 'keyframes'
