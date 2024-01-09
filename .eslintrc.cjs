// This patch is a workaround for a longstanding ESLint feature request that
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: [
    '@will-stone/eslint-config-base',
    '@will-stone/eslint-config-typescript',
    '@will-stone/eslint-config-react',
    '@will-stone/eslint-config-node',
    '@will-stone/eslint-config-prettier',
  ],
  rules: {
    // Specific key order is used throughout this project, like the order of keyboard keys
    'sort-keys': 'off',
  },
  overrides: [
    {
      files: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
      extends: ['plugin:vitest/all'],
      rules: {
        'vitest/prefer-expect-assertions': 'off',
        'vitest/max-expects': 'off',
        'vitest/no-hooks': 'off',
        'vitest/require-top-level-describe': 'off',
      },
    },
  ],
}
