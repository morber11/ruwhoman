import { sharedRules } from '@ruwhoman/eslint-config'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        'jest.config.ts',
                        'src/test-setup.ts',
                        'src/test-utils.tsx',
                        'src/features/challenge/ChallengePage.test.tsx',
                        'src/features/create/CreatePage.test.tsx',
                        'src/features/monitor/MonitorPage.test.tsx',
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            ...sharedRules,
        },
    },
])
