import { IsOptional, IsIn } from 'class-validator';
import { CAPTCHA_TYPE_MATH, CAPTCHA_TYPE_TEXT } from '@ruwhoman/shared';

export class CreateChallengeDto {
    @IsOptional()
    @IsIn([CAPTCHA_TYPE_MATH, CAPTCHA_TYPE_TEXT])
    type?: string;
}
