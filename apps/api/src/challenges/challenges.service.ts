import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Challenge } from './challenge.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { CaptchaService } from './captcha.service';
import { RecaptchaV3Service } from '../recaptcha/recaptcha-v3.service';
import { RecaptchaV2Service } from '../recaptcha/recaptcha-v2.service';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { CaptchaType, ChallengeStatus } from '@ruwhoman/shared';
import { SLIDER_TOLERANCE } from './slider.service';

@Injectable()
export class ChallengesService {
    constructor(
        @InjectRepository(Challenge)
        private readonly repo: Repository<Challenge>,
        private readonly captcha: CaptchaService,
        private readonly recaptchaV3: RecaptchaV3Service,
        private readonly recaptchaV2: RecaptchaV2Service,
        private readonly config: ConfigService,
    ) { }

    async getMonitorStatus(monitorToken: string) {
        const challenge = await this.repo.findOne({
            where: { monitorToken },
        });

        if (!challenge) {
            throw new NotFoundException();
        }

        const status =
            challenge.status === ChallengeStatus.PENDING && challenge.expiresAt < new Date()
                ? ChallengeStatus.EXPIRED
                : challenge.status;

        return {
            status,
            createdAt: challenge.createdAt,
            expiresAt: challenge.expiresAt,
            completedAt: challenge.completedAt,
        };
    }

    async create(dto: CreateChallengeDto = {}): Promise<{ challengeUrl: string; monitorUrl: string }> {
        const challengeToken = randomBytes(6).toString('base64url');
        const monitorToken = randomBytes(18).toString('base64url');

        const captcha = this.captcha.generate(dto.type);
        const now = new Date(); // Date is fine because we're stored it as timestamptz

        await this.repo.save({
            challengeToken,
            monitorToken,
            type: captcha.type,
            question: captcha.question,
            answer: captcha.answer,
            attempts: dto.attempts ?? 1,
            remainingAttempts: dto.attempts ?? 1,
            expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        });

        const base = this.config.get<string>('FRONTEND_URL');
        return {
            challengeUrl: `${base}/${challengeToken}`,
            monitorUrl: `${base}/monitor/${monitorToken}`,
        };
    }

    async getByToken(token: string): Promise<Challenge> {
        const challenge = await this.repo.findOne({
            where: { challengeToken: token },
        });

        if (!challenge) {
            throw new NotFoundException();
        }

        if (challenge.expiresAt < new Date()) {
            throw new NotFoundException();
        }

        if (challenge.status !== ChallengeStatus.PENDING) {
            throw new ConflictException();
        }

        return challenge;
    }

    async submit(token: string, answer: string): Promise<{ passed: boolean; attemptsLeft: number }> {
        const challenge = await this.getByToken(token);

        let passed: boolean;

        // consider abstracting this at a separate point instead of if/else
        if (challenge.type === CaptchaType.RECAPTCHA_V3) {
            passed = await this.recaptchaV3.verify(answer);
        } else if (challenge.type === CaptchaType.RECAPTCHA_V2) {
            passed = await this.recaptchaV2.verify(answer);
        } else if (challenge.type === CaptchaType.SLIDER) {
            passed = Math.abs(Number(answer) - Number(challenge.answer)) <= SLIDER_TOLERANCE;
        } else {
            passed = answer.trim() === challenge.answer;
        }

        if (passed) {
            await this.repo.update(challenge.id, {
                status: ChallengeStatus.PASSED,
                completedAt: new Date(),
            });

            return { passed, attemptsLeft: challenge.remainingAttempts };
        }

        await this.repo.decrement(
            { id: challenge.id, remainingAttempts: MoreThan(0) },
            'remainingAttempts',
            1,
        );

        const current = await this.repo.findOneBy({ id: challenge.id });
        const remainingAttempts = current?.remainingAttempts ?? 0;

        if (remainingAttempts <= 0) {
            await this.repo.update(challenge.id, {
                status: ChallengeStatus.FAILED,
                completedAt: new Date(),
            });
        }

        return { passed, attemptsLeft: remainingAttempts };
    }
}
