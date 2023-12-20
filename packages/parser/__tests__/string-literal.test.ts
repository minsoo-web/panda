import { describe, expect, test } from 'vitest'
import { cssTemplateLiteralParser } from './fixture'

describe('ast parser / string literal', () => {
  test('should parse', () => {
    const code = `
    import { panda } from ".panda/jsx"

    const baseStyle = panda.div\`
        background: transparent;
        border-radius: 3px;
        border: 1px solid var(--accent-color);
        color: var(--accent-color);
        display: inline-block;
        margin: 0.5rem 1rem;
        padding: 0.5rem 0;
        transition: all 200ms ease-in-out;
        width: 11rem;
    \`
     `

    expect(cssTemplateLiteralParser(code)).toMatchInlineSnapshot(`
      {
        "css": Set {},
      }
    `)
  })
})
