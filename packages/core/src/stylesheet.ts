import { logger } from '@pandacss/logger'
import type { Dict, StylesCollectorType, SystemStyleObject, UserConfig } from '@pandacss/types'
import postcss, { CssSyntaxError } from 'postcss'
import { expandCssFunctions, optimizeCss } from './optimize'
import { serializeStyles } from './serialize'
import { toCss } from './to-css'
import type { StylesheetContext } from './types'

export type StylesheetOptions = {
  content?: string
}

export interface ProcessOptions {
  styles: Dict
  layer: LayerName
}

export interface ToCssOptions extends Pick<UserConfig, 'optimize' | 'minify'> {}

export type LayerName = Exclude<keyof StylesheetContext['layers'], 'insert'>

export class Stylesheet {
  constructor(private context: StylesheetContext, private options?: StylesheetOptions) {}

  getLayer(layer: string) {
    return this.context.layers[layer as LayerName] as postcss.AtRule | undefined
  }

  process(options: ProcessOptions) {
    const layer = this.getLayer(options.layer)
    if (!layer) return

    const { styles } = options

    // shouldn't happen, but just in case
    if (typeof styles !== 'object') return

    try {
      layer.append(toCss(styles).toString())
    } catch (error) {
      if (error instanceof CssSyntaxError) {
        logger.error('sheet', error.message)
        logger.error('sheet', error.showSourceCode())
        error.plugin && logger.error('sheet', `By plugin: ${error.plugin}:`)
      }

      logger.error('sheet', error)
    }
    return
  }

  processGlobalCss = (styleObject: Dict) => {
    const { conditions, utility } = this.context
    const css = serializeStyles(styleObject, { conditions, utility })

    this.context.layers.base.append(css)
  }

  processCssObject = (styles: SystemStyleObject | undefined, layer: LayerName) => {
    if (!styles) return
    this.process({ styles, layer })
  }

  processStylesCollector = (collector: StylesCollectorType) => {
    collector.atomic.forEach((css) => {
      this.processCssObject(css.result, (css.layer as LayerName) ?? 'utilities')
    })

    collector.recipes.forEach((recipeSet) => {
      recipeSet.forEach((recipe) => {
        this.processCssObject(recipe.result, 'recipes')
      })
    })

    collector.recipes_base.forEach((recipeSet) => {
      recipeSet.forEach((recipe) => {
        this.processCssObject(recipe.result, 'recipes_base')
      })
    })

    collector.recipes_slots.forEach((recipeSet) => {
      recipeSet.forEach((recipe) => {
        this.processCssObject(recipe.result, 'recipes_slots')
      })
    })

    collector.recipes_slots_base.forEach((recipeSet) => {
      recipeSet.forEach((recipe) => {
        this.processCssObject(recipe.result, 'recipes_slots_base')
      })
    })
  }

  toCss = ({ optimize = false, minify }: ToCssOptions = {}) => {
    try {
      const { utility } = this.context
      const breakpoints = this.context.conditions.breakpoints
      this.context.root = this.context.layers.insert()

      breakpoints.expandScreenAtRule(this.context.root)
      expandCssFunctions(this.context.root, { token: utility.getToken, raw: this.context.utility.tokens.getByName })

      let css = this.context.root.toString()

      if (optimize) {
        css = optimizeCss(css, { minify })
      }

      if (this.options?.content) {
        css = `${this.options.content}\n\n${css}`
      }

      return optimize ? optimizeCss(css, { minify }) : css
    } catch (error) {
      if (error instanceof CssSyntaxError) {
        logger.error('sheet', error.message)
        console.log(error.showSourceCode())
        error.plugin && logger.error('sheet', `By plugin: ${error.plugin}:`)

        if (error.source) {
          logger.error('sheet', `Line ${error.line}:${error.column}, in:`)
          logger.error('sheet', error.source)
        }
      }

      throw error
    }
  }

  append = (...css: string[]) => {
    this.context.root.append(...css)
  }

  prepend = (...css: string[]) => {
    this.context.root.prepend(...css)
  }
}
