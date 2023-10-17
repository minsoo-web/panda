import { createGeneratorContext } from '@pandacss/fixture'
import { type Config } from '@pandacss/types'
import { RuleProcessor } from '../src/engines/rule-processor'
import type { Context } from '../src/engines'

export const createRuleProcessor = (userConfig?: Config) => {
  const ctx = createGeneratorContext(userConfig) as any as Context
  return new RuleProcessor(ctx, { hash: ctx.hashCollector, styles: ctx.stylesCollector })
}

export function processRecipe(
  recipe: 'buttonStyle' | 'textStyle' | 'tooltipStyle' | 'checkbox',
  value: Record<string, any>,
) {
  return createRuleProcessor().recipe(recipe, value)?.toCss()
}
