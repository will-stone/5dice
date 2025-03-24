import config from '@will-stone/eslint-config'

export default [
  ...(await config()),
  {
    rules: {
      'sort-keys': 'off',
    },
  },
]
