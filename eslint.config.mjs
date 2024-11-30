// @ts-check
import eslint from '@eslint/js';
// @ts-expect-error: package has no type declarations
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  // global ignores. also ignore temporarily bundled rollup config
  { ignores: ['lib', 'tmp', 'rollup.config-*.mjs'] },
  {
    files: ['.mocharc.cjs', 'examples/*', 'test/fixtures/*'],
    languageOptions: { globals: globals.node }
  },
  {
    // for *.ts files only
    files: ['**/*.ts'],
    rules: { '@typescript-eslint/explicit-module-boundary-types': 'error' }
  },
  {
    rules: {
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      curly: 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-constant-condition': 'error',
      'no-throw-literal': 'error',
      'no-unused-expressions': 'off', // use typescript-eslint
      'no-unused-vars': 'off', // use typescript-eslint
      'no-var': 'error',
      'prefer-const': 'error',
      quotes: ['error', 'single', 'avoid-escape'],
      semi: 'error'
    }
  },
  {
    // for tests only, override no-unused-expressions
    files: ['**/*.spec.ts'],
    plugins: { 'chai-friendly': pluginChaiFriendly },
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'chai-friendly/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }
      ],
      'no-unused-expressions': 'off'
    }
  }
);
