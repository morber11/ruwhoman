import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    testPathIgnorePatterns: ['/e2e/'],
    transform: {
        '^.+\\.(t|j)sx?$': [
            '@swc/jest',
            {
                jsc: {
                    transform: { react: { runtime: 'automatic' } },
                },
            },
        ],
    },
};

export default config;
