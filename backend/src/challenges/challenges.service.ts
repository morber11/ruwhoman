import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from './challenge.entity';
import { CaptchaService } from './captcha.service';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class ChallengesService {
    constructor(
        @InjectRepository(Challenge)
        private readonly repo: Repository<Challenge>,
        private readonly captcha: CaptchaService,
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
            challenge.status === 'pending' && challenge.expiresAt < new Date()
                ? 'expired'
                : challenge.status;

        return {
            status,
            createdAt: challenge.createdAt,
            expiresAt: challenge.expiresAt,
            completedAt: challenge.completedAt,
        };
    }

    async create(): Promise<{ challengeUrl: string; monitorUrl: string }> {
        const challengeToken = randomBytes(6).toString('base64url');
        const monitorToken = randomBytes(18).toString('base64url');
        const captcha = this.captcha.generate();
        const now = new Date(); // Date is fine because we're stored it as timestamptz

        await this.repo.save({
            challengeToken,
            monitorToken,
            type: captcha.type,
            question: captcha.question,
            answer: captcha.answer,
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

        if (challenge.status !== 'pending') {
            throw new ConflictException();
        }

        return challenge;
    }

    async submit(token: string, answer: string): Promise<{ passed: boolean }> {
        const challenge = await this.getByToken(token);
        const passed = answer.trim() === challenge.answer;

        await this.repo.update(challenge.id, {
            status: passed ? 'passed' : 'failed',
            completedAt: new Date(),
        });

        return { passed };
    }
}
