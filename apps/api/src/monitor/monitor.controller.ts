import { Controller, Get, Param } from '@nestjs/common';
import { ChallengesService } from '../challenges/challenges.service';

@Controller('monitor')
export class MonitorController {
    constructor(private readonly service: ChallengesService) { }

    @Get(':token')
    getStatus(@Param('token') token: string) {
        return this.service.getMonitorStatus(token);
    }
}
