import config from '@will-stone/eslint-config'
import vitest from 'eslint-plugin-vitest'

export default [
  ...config({}),
  {
    rules: {
      'sort-keys': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.all.rules,
      'vitest/prefer-expect-assertions': 'off',
      'vitest/max-expects': 'off',
      'vitest/no-hooks': 'off',
      'vitest/require-top-level-describe': 'off',
    },
  },
]
