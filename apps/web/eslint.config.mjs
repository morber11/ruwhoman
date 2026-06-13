import { sharedRules } from '../../eslint.config.mjs';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

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
                    maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 20,
                    allowDefaultProject: [
                        'jest.config.ts',
                        'playwright.config.ts',
                        'e2e/create.spec.ts',
                        'e2e/challenge.spec.ts',
                        'e2e/monitor.spec.ts',
                        'e2e/not-found.spec.ts',
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
