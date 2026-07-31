import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { mock } from 'jest-mock-extended';
import { ChallengesService } from './challenges.service';
import { CaptchaService } from './captcha.service';
import { SliderService } from './slider.service';
import { RecaptchaV3Service } from '../recaptcha/recaptcha-v3.service';
import { RecaptchaV2Service } from '../recaptcha/recaptcha-v2.service';
import { Challenge } from './challenge.entity';
import { ChallengeStatus } from '@ruwhoman/shared';
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
    status: ChallengeStatus.PENDING,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completedAt: null,
    attempts: 1,
    remainingAttempts: 1,
    ...overrides,
});

describe('ChallengesService', () => {
    let service: ChallengesService;
    let repo: jest.Mocked<Repository<Challenge>>;
    let recaptchaV3Service: { verify: jest.Mock };
    let recaptchaV2Service: { verify: jest.Mock };

    beforeEach(async () => {
        repo = mock<Repository<Challenge>>();
        recaptchaV3Service = { verify: jest.fn().mockResolvedValue(true) };
        recaptchaV2Service = { verify: jest.fn().mockResolvedValue(true) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChallengesService,
                CaptchaService,
                SliderService,
                {
                    provide: getRepositoryToken(Challenge),
                    useValue: repo,
                },
                {
                    provide: RecaptchaV3Service,
                    useValue: recaptchaV3Service,
                },
                {
                    provide: RecaptchaV2Service,
                    useValue: recaptchaV2Service,
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

        it('sets attempts and remainingAttempts to 1 by default', async () => {
            await service.create();

            const saved = (repo.save as jest.Mock).mock.calls[0][0] as Partial<Challenge>;
            expect(saved.attempts).toBe(1);
            expect(saved.remainingAttempts).toBe(1);
        });

        it('saves configured attempts', async () => {
            await service.create({ attempts: 5 });

            const saved = (repo.save as jest.Mock).mock.calls[0][0] as Partial<Challenge>;
            expect(saved.attempts).toBe(5);
            expect(saved.remainingAttempts).toBe(5);
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
                makeChallenge({ status: ChallengeStatus.PASSED }),
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

            expect(result).toEqual({ passed: true, attemptsLeft: 1 });
            expect(repo.update).toHaveBeenCalledWith('uuid', {
                status: ChallengeStatus.PASSED,
                completedAt: expect.any(Date),
            });
        });

        it('returns { passed: false } and persists status for wrong answer', async () => {
            repo.findOne.mockResolvedValue(makeChallenge());
            repo.findOneBy.mockResolvedValue(makeChallenge({ remainingAttempts: 0 }));
            const result = await service.submit('token123', 'wrong');

            expect(result).toEqual({ passed: false, attemptsLeft: 0 });
            expect(repo.decrement).toHaveBeenCalled();
            expect(repo.update).toHaveBeenCalledWith('uuid', {
                status: ChallengeStatus.FAILED,
                completedAt: expect.any(Date),
            });
        });

        it('consumes one attempt per wrong answer and fails at zero', async () => {
            repo.findOne.mockResolvedValue(makeChallenge({ remainingAttempts: 2 }));
            repo.findOneBy.mockResolvedValue(makeChallenge({ remainingAttempts: 1 }));
            const first = await service.submit('token123', 'wrong');

            expect(first).toEqual({ passed: false, attemptsLeft: 1 });
            expect(repo.update).not.toHaveBeenCalled();

            repo.findOne.mockResolvedValue(makeChallenge({ remainingAttempts: 1 }));
            repo.findOneBy.mockResolvedValue(makeChallenge({ remainingAttempts: 0 }));
            const second = await service.submit('token123', 'wrong');

            expect(second).toEqual({ passed: false, attemptsLeft: 0 });
            expect(repo.update).toHaveBeenCalledWith('uuid', {
                status: ChallengeStatus.FAILED,
                completedAt: expect.any(Date),
            });
        });

        it('delegates to RecaptchaV3Service for recaptcha-v3 type', async () => {
            repo.findOne.mockResolvedValue(makeChallenge({ type: 'recaptcha-v3', answer: '' }));
            recaptchaV3Service.verify.mockResolvedValue(true);

            const result = await service.submit('token123', 'v3-token');

            expect(recaptchaV3Service.verify).toHaveBeenCalledWith('v3-token');
            expect(result).toEqual({ passed: true, attemptsLeft: 1 });
            expect(repo.update).toHaveBeenCalledWith('uuid', {
                status: ChallengeStatus.PASSED,
                completedAt: expect.any(Date),
            });
        });

        it('returns { passed: false } when RecaptchaV3Service returns false', async () => {
            repo.findOne.mockResolvedValue(makeChallenge({ type: 'recaptcha-v3', answer: '' }));
            repo.findOneBy.mockResolvedValue(makeChallenge({ remainingAttempts: 0 }));
            recaptchaV3Service.verify.mockResolvedValue(false);

            const result = await service.submit('token123', 'bad-v3-token');

            expect(result).toEqual({ passed: false, attemptsLeft: 0 });
            expect(repo.update).toHaveBeenCalledWith('uuid', {
                status: ChallengeStatus.FAILED,
                completedAt: expect.any(Date),
            });
        });

        it('delegates to RecaptchaV2Service for recaptcha-v2 type', async () => {
            repo.findOne.mockResolvedValue(makeChallenge({ type: 'recaptcha-v2', answer: '' }));
            recaptchaV2Service.verify.mockResolvedValue(true);

            const result = await service.submit('token123', 'v2-token');

            expect(recaptchaV2Service.verify).toHaveBeenCalledWith('v2-token');
            expect(result).toEqual({ passed: true, attemptsLeft: 1 });
            expect(repo.update).toHaveBeenCalledWith('uuid', {
                status: ChallengeStatus.PASSED,
                completedAt: expect.any(Date),
            });
        });

        it('returns { passed: false } when RecaptchaV2Service returns false', async () => {
            repo.findOne.mockResolvedValue(makeChallenge({ type: 'recaptcha-v2', answer: '' }));
            repo.findOneBy.mockResolvedValue(makeChallenge({ remainingAttempts: 0 }));
            recaptchaV2Service.verify.mockResolvedValue(false);

            const result = await service.submit('token123', 'bad-v2-token');

            expect(result).toEqual({ passed: false, attemptsLeft: 0 });
            expect(repo.update).toHaveBeenCalledWith('uuid', {
                status: ChallengeStatus.FAILED,
                completedAt: expect.any(Date),
            });
        });
    });
});
