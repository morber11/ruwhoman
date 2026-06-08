import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from './challenge.entity';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { CaptchaService } from './captcha.service';

@Module({
    imports: [TypeOrmModule.forFeature([Challenge])],
    controllers: [ChallengesController],
    providers: [ChallengesService, CaptchaService],
    exports: [ChallengesService],
})

export class ChallengesModule { }
