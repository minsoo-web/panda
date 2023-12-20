import type { Context } from '../../engines'
import type { Stylesheet } from '@pandacss/core'

export const generateStaticCss = (ctx: Context, sheet?: Stylesheet) => {
  const { config, staticCss } = ctx
  const { optimize = true, minify, theme = {} } = config

  const rules = config.staticCss ?? {}
  rules.recipes = rules.recipes ?? {}

  const recipeConfigs = Object.assign({}, theme.recipes ?? {}, theme.slotRecipes ?? {})

  Object.entries(recipeConfigs).forEach(([name, recipe]) => {
    if (recipe.staticCss) {
      rules.recipes![name] = recipe.staticCss
    }
  })

  const engine = staticCss.process(rules, sheet)

  if (!sheet) {
    const output = engine.sheet.toCss({ optimize, minify })
    void ctx.hooks.callHook('generator:css', 'static.css', output)
    return output
  }
}
