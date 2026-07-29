import { Module } from '@nestjs/common';
import { RecaptchaV3Service } from './recaptcha-v3.service';
import { RecaptchaV2Service } from './recaptcha-v2.service';

@Module({
    providers: [RecaptchaV3Service, RecaptchaV2Service],
    exports: [RecaptchaV3Service, RecaptchaV2Service],
})
export class RecaptchaModule { }
