import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from '../challenges/challenge.entity';

@Controller('monitor')
export class MonitorController {
    constructor(
        @InjectRepository(Challenge)
        private readonly repo: Repository<Challenge>,
    ) { }

    @Get(':token')
    async getStatus(@Param('token') token: string) {
        const challenge = await this.repo.findOne({
            where: { monitorToken: token },
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
}
