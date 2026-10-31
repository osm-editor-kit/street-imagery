import { defineConfig } from 'oxfmt'

export default defineConfig({
  useTabs: false,
  tabWidth: 2,
  printWidth: 100,
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  semi: false,
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: 'lf',
  sortImports: {
    newlinesBetween: false,
  },
  sortTailwindcss: {
    stylesheet: 'apps/preview/src/index.css',
    functions: ['twMerge', 'twJoin', 'clsx'],
  },
  sortPackageJson: true,
  ignorePatterns: [
    '.agents/**',
    '.claude/**',
    '.cursor/**',
    '**/CHANGELOG.md',
    '**/dist/**',
    '**/routeTree.gen.ts',
    '.changeset/*.md',
    'playwright-report/**',
    'test-results/**',
  ],
})
