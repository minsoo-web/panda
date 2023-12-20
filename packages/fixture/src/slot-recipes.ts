import type { SlotRecipeConfig } from '@pandacss/types'

export const slotRecipes: Record<string, SlotRecipeConfig> = {
  button: {
    className: 'button',
    slots: ['container', 'icon'],
    base: {
      container: {
        fontFamily: 'mono',
      },
      icon: {
        fontSize: '1.5rem',
      },
    },
    variants: {
      size: {
        sm: {
          container: {
            fontSize: '5rem',
            lineHeight: '1em',
          },
          icon: {
            fontSize: '2rem',
          },
        },

        md: {
          container: {
            fontSize: '3rem',
            lineHeight: '1.2em',
          },
        },
      },
    },
  },
  checkbox: {
    className: 'checkbox',
    slots: ['root', 'control', 'label'],
    base: {
      root: { display: 'flex', alignItems: 'center', gap: '2' },
      control: { borderWidth: '1px', borderRadius: 'sm' },
      label: { marginStart: '2' },
    },
    variants: {
      size: {
        sm: {
          control: { textStyle: 'headline.h1', width: '8', height: '8' },
          label: { fontSize: 'sm' },
        },
        md: {
          control: { width: '10', height: '10' },
          label: { fontSize: 'md' },
        },
        lg: {
          control: { width: '12', height: '12' },
          label: { fontSize: 'lg' },
        },
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
}
