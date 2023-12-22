import { logger } from '@pandacss/logger'
import type { CascadeLayer, Dict, StyleCollectorType, SystemStyleObject, UserConfig } from '@pandacss/types'
import { CssSyntaxError } from 'postcss'
import { expandCssFunctions, optimizeCss } from './optimize'
import { serializeStyles } from './serialize'
import { toCss } from './to-css'
import type { StylesheetContext } from './types'

export interface ProcessOptions {
  styles: Dict
  layer: LayerName
}
export interface ToCssOptions extends Pick<UserConfig, 'optimize' | 'minify'> {}

export type LayerName =
  | 'base'
  | 'reset'
  | 'recipes_slots_base'
  | 'recipes_base'
  | 'tokens'
  | 'recipes'
  | 'utilities'
  | 'recipes_slots'
  | 'compositions'

export class Stylesheet {
  constructor(private context: StylesheetContext) {}

  getLayer(layer: LayerName) {
    switch (layer) {
      case 'reset':
        return this.context.layers.reset
      case 'base':
        return this.context.layers.base
      case 'tokens':
        return this.context.layers.tokens
      case 'recipes_base':
        return this.context.layers.recipes.base
      case 'recipes':
        return this.context.layers.recipes.root
      case 'recipes_slots_base':
        return this.context.layers.slotRecipes.base
      case 'recipes_slots':
        return this.context.layers.slotRecipes.root
      case 'utilities':
        return this.context.layers.utilities.root
      case 'compositions':
        return this.context.layers.utilities.compositions
      default:
        // TODO, when is this called ?
        return this.context.layers.utilities.custom(layer)
    }
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
        logger.error('sheet:process', error)
      }
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

  processStyleCollector = (collector: StyleCollectorType) => {
    collector.atomic.forEach((css) => {
      this.processCssObject(css.result, (css.layer as LayerName) ?? 'utilities')
    })

    collector.recipes.forEach((recipeSet) => {
      recipeSet.forEach((recipe) => {
        this.processCssObject(recipe.result, recipe.entry.slot ? 'recipes_slots' : 'recipes')
      })
    })

    collector.recipes_base.forEach((recipeSet) => {
      recipeSet.forEach((recipe) => {
        this.processCssObject(recipe.result, recipe.slot ? 'recipes_slots_base' : 'recipes_base')
      })
    })
  }

  getLayerCss = (...layers: CascadeLayer[]) => {
    return optimizeCss(
      layers
        .map((layer: CascadeLayer) => {
          return this.context.layers.getLayer(layer).toString()
        })
        .join('\n'),
    )
  }

  toCss = ({ optimize = false, minify }: { optimize?: boolean; minify?: boolean } = {}) => {
    try {
      const { utility } = this.context
      const breakpoints = this.context.conditions.breakpoints

      const root = this.context.layers.insert()

      breakpoints.expandScreenAtRule(root)
      expandCssFunctions(root, { token: utility.getToken, raw: this.context.utility.tokens.getByName })

      const css = root.toString()

      return optimize ? optimizeCss(css, { minify }) : css
    } catch (error) {
      if (error instanceof CssSyntaxError) {
        logger.error('sheet:toCss', error.message)
        error.plugin && logger.error('sheet:toCss', `By plugin: ${error.plugin}:`)

        if (error.source) {
          logger.error('sheet:toCss', `Line ${error.line}:${error.column}, in:`)
          logger.error('sheet:toCss', error.source)
        }
      }

      throw error
    }
  }

  append = (...css: string[]) => {
    this.context.layers.root.append(...css)
  }

  prepend = (...css: string[]) => {
    this.context.layers.root.prepend(...css)
  }

  clean = () => {
    this.context.layers.clean()
  }
}
