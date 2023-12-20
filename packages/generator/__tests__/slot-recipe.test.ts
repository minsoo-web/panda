import { describe, expect, test } from 'vitest'
import { processRecipe } from './fixture'

describe('slot recipe ruleset', () => {
  test('should work', () => {
    expect(processRecipe('checkbox', { size: 'sm' })).toMatchInlineSnapshot(`
      "@layer recipes.slots {

        .checkbox__control--size_sm {
          font-size: 2rem;
          font-weight: var(--font-weights-bold);
          width: var(--sizes-8);
          height: var(--sizes-8)
      }

        .checkbox__label--size_sm {
          font-size: var(--font-sizes-sm)
      }

        @layer _base {
          .checkbox__root {
            display: flex;
            align-items: center;
            gap: var(--spacing-2)
      }

          .checkbox__control {
            border-width: 1px;
            border-radius: var(--radii-sm)
      }

          .checkbox__label {
            margin-inline-start: var(--spacing-2)
      }
      }
      }"
    `)
  })

  test('assigned recipe with default jsx from slots', () => {
    expect(processRecipe('checkbox', { size: 'sm' })).toMatchInlineSnapshot(`
      "@layer recipes.slots {

        .checkbox__control--size_sm {
          font-size: 2rem;
          font-weight: var(--font-weights-bold);
          width: var(--sizes-8);
          height: var(--sizes-8)
      }

        .checkbox__label--size_sm {
          font-size: var(--font-sizes-sm)
      }

        @layer _base {
          .checkbox__root {
            display: flex;
            align-items: center;
            gap: var(--spacing-2)
      }

          .checkbox__control {
            border-width: 1px;
            border-radius: var(--radii-sm)
      }

          .checkbox__label {
            margin-inline-start: var(--spacing-2)
      }
      }
      }"
    `)
  })
})
