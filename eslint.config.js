import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // The i18n provider module exports its `useLanguage` hook alongside
      // the `LanguageProvider` component (standard custom-hook + provider
      // pattern); allowlisting the hook keeps fast-refresh intact for the
      // component while the workspace lints clean.
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true, allowCompoundComponents: true, allowExportNames: ['useLanguage'] },
      ],
    },
  },
])
