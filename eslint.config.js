import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],

    rules: {
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: ['Password'],
        },
      ],
    },

    'vue/no-reserved-component-names': [
      'error',
      {
        disallowVueBuiltInComponents: false,
        disallowVue3BuiltInComponents: false,
        htmlElementCaseSensitive: false,
      },
    ],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
])
