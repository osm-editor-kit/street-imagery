import { defineConfig } from 'oxlint'
import reactHooksJs from 'oxlint-config-react-hooks-js/configs/recommended-latest.json' with { type: 'json' }

export default defineConfig({
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'react'],
  options: { typeAware: true },
  ignorePatterns: [
    '.agents/**',
    '.claude/**',
    '.cursor/**',
    '**/dist/**',
    '**/routeTree.gen.ts',
    'playwright-report/**',
    'test-results/**',
  ],
  rules: {
    'typescript/switch-exhaustiveness-check': [
      'error',
      { considerDefaultExhaustiveForUnions: true },
    ],
    'react/unsupported-syntax': 'error',
    'eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['apps/preview/src/**/*.ts', 'apps/preview/src/**/*.tsx'],
      excludeFiles: ['**/*.test.ts', '**/*.test.tsx'],
      jsPlugins: [{ name: 'compat', specifier: 'eslint-plugin-compat' }],
      rules: {
        'compat/compat': 'error',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'typescript/no-non-null-assertion': 'off',
        'react/rules-of-hooks': 'off',
      },
    },
    {
      files: ['packages/**/*.tsx'],
      jsPlugins: [{ name: 'react-hooks-js', specifier: 'eslint-plugin-react-hooks' }],
      rules: {
        ...reactHooksJs.rules,
      },
    },
  ],
})
