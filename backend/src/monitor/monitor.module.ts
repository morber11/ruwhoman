import { Module } from '@nestjs/common';
import { ChallengesModule } from '../challenges/challenges.module';
import { MonitorController } from './monitor.controller';

@Module({
    imports: [ChallengesModule],
    controllers: [MonitorController],
})
export class MonitorModule { }
