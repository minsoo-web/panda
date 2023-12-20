import { logger } from '@pandacss/logger'
import { PandaContext, type CssArtifactType } from '@pandacss/node'
import { resolve } from 'pathe'

const ensureFile = (ctx: PandaContext, cwd: string, file: string) => {
  const outPath = resolve(cwd, file)
  const dirname = ctx.runtime.path.dirname(outPath)
  ctx.runtime.fs.ensureDirSync(dirname)
}

export interface CssGenOptions {
  cwd: string
  outfile?: string
  cssArtifact?: CssArtifactType
  minimal?: boolean
}

export const cssgen = async (ctx: PandaContext, options: CssGenOptions) => {
  const { cwd, outfile, cssArtifact, minimal } = options

  //
  if (cssArtifact) {
    //
    ctx.appendCss(cssArtifact)

    if (outfile) {
      ensureFile(ctx, cwd, outfile)
      ctx.runtime.fs.writeFileSync(outfile, ctx.getCss())
    } else {
      await ctx.writeCss()
    }

    const msg = ctx.messages.cssArtifactComplete(cssArtifact)
    logger.info('css:emit:artifact', msg)
    //
  } else {
    //
    if (!minimal) {
      ctx.appendLayerParams()
      ctx.appendBaselineCss()
    }

    const files = ctx.appendFilesCss()

    if (outfile) {
      ensureFile(ctx, cwd, outfile)
      ctx.runtime.fs.writeFileSync(outfile, ctx.getCss())
    } else {
      await ctx.writeCss()
    }

    const msg = ctx.messages.buildComplete(files.length)
    logger.info('css:emit:out', msg)
  }
}
