import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Idempotent tests
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    sequence: { shuffle: true },
    unstubEnvs: true,
  },
})
