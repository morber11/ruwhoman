import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { CaptchaType } from '@ruwhoman/shared';

export class CreateChallengeDto {
    @IsOptional()
    @IsIn(Object.values(CaptchaType))
    type?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    attempts?: number;
}
