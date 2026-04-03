import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    name: 'logic-grid',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,ts,jsx,tsx}'],
    reporters: ['default'],
    passWithNoTests: true,
  },
});
