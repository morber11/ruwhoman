import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { mock } from 'jest-mock-extended';
import { ChallengesService } from './challenges.service';
import { CaptchaService } from './captcha.service';
import { Challenge } from './challenge.entity';
import {
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import type { Repository } from 'typeorm';

const makeChallenge = (
    overrides: Partial<Challenge> = {},
): Challenge => ({
    id: 'uuid',
    challengeToken: 'token123',
    monitorToken: 'monitor123',
    type: 'math',
    question: 'What is 1 + 1?',
    answer: '2',
    status: 'pending' as const,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completedAt: null,
    ...overrides,
});

describe('ChallengesService', () => {
    let service: ChallengesService;
    let repo: jest.Mocked<Repository<Challenge>>;

    beforeEach(async () => {
        repo = mock<Repository<Challenge>>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChallengesService,
                CaptchaService,
                {
                    provide: getRepositoryToken(Challenge),
                    useValue: repo,
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'FRONTEND_URL')
                                return 'http://localhost:5173';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get(ChallengesService);
    });

    describe('create', () => {
        it('sets expiresAt 24h in the future', async () => {
            const before = Date.now();
            await service.create();
            const after = Date.now();

            expect(repo.save).toHaveBeenCalledTimes(1);
             
            const saved = (repo.save as jest.Mock).mock.calls[0][0] as Partial<Challenge>;
            expect(saved.expiresAt!.getTime()).toBeGreaterThanOrEqual(
                before + 24 * 60 * 60 * 1000 - 1000,
            );

            expect(saved.expiresAt!.getTime()).toBeLessThanOrEqual(
                after + 24 * 60 * 60 * 1000 + 1000,
            );

            expect(saved.challengeToken).toMatch(/^[A-Za-z0-9_-]{8}$/);
            expect(saved.monitorToken).toMatch(/^[A-Za-z0-9_-]{24}$/);
        });
    });

    describe('getByToken', () => {
        it('throws NotFoundException for unknown token', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.getByToken('unknown')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('throws NotFoundException for expired challenge', async () => {
            repo.findOne.mockResolvedValue(
                makeChallenge({ expiresAt: new Date(Date.now() - 1000) }),
            );

            await expect(service.getByToken('token123')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('throws ConflictException for completed challenge', async () => {
            repo.findOne.mockResolvedValue(
                makeChallenge({ status: 'passed' }),
            );

            await expect(service.getByToken('token123')).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('submit', () => {
        it('returns { passed: true } and persists status for correct answer', async () => {

            repo.findOne.mockResolvedValue(makeChallenge());
            const result = await service.submit('token123', '2');


            expect(result).toEqual({ passed: true });
            expect(repo.update).toHaveBeenCalledWith('uuid', {
                status: 'passed',
                 
                completedAt: expect.any(Date),
            });
        });

        it('returns { passed: false } and persists status for wrong answer', async () => {

            repo.findOne.mockResolvedValue(makeChallenge());
            const result = await service.submit('token123', 'wrong');

            expect(result).toEqual({ passed: false });
            expect(repo.update).toHaveBeenCalledWith('uuid', {
                status: 'failed',
                 
                completedAt: expect.any(Date),
            });
        });
    });
});
