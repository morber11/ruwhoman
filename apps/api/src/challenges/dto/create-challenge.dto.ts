import { IsOptional, IsIn } from 'class-validator';
import { CaptchaType } from '@ruwhoman/shared';

export class CreateChallengeDto {
    @IsOptional()
    @IsIn(Object.values(CaptchaType))
    type?: string;
}
