import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from './challenge.entity';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { CaptchaService } from './captcha.service';
import { SliderService } from './slider.service';
import { RecaptchaModule } from '../recaptcha/recaptcha.module';

@Module({
    imports: [TypeOrmModule.forFeature([Challenge]), RecaptchaModule],
    controllers: [ChallengesController],
    providers: [ChallengesService, CaptchaService, SliderService],
    exports: [ChallengesService],
})

export class ChallengesModule { }
