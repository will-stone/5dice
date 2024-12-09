import config from '@will-stone/eslint-config'

export default [
  ...config({}),
  {
    rules: {
      'sort-keys': 'off',
    },
  },
]
