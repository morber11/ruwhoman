import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Challenge } from '../challenges/challenge.entity';

@Injectable()
export class CleanupService {
    private readonly logger = new Logger(CleanupService.name);

    constructor(
        @InjectRepository(Challenge)
        private readonly repo: Repository<Challenge>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteExpired() {
        // add a buffer to ensure we don't delete recently expired challenges
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const result = await this.repo.delete({
            expiresAt: LessThan(cutoff),
        });

        if (result.affected && result.affected > 0) {
            this.logger.log(`Deleted ${result.affected} expired challenges`);
        }
    }
}
