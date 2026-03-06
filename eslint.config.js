const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['.bootstrap/**', '.expo/**', 'node_modules/**', 'dist/**'],
  },
]);
