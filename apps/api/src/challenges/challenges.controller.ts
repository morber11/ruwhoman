import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { SliderService, type SliderResult } from './slider.service';
import { CaptchaType } from '@ruwhoman/shared';

@Controller('challenges')
export class ChallengesController {
    private renderCache = new Map<string, SliderResult>();

    constructor(
        private readonly service: ChallengesService,
        private readonly sliderService: SliderService,
    ) { }

    @Post()
    create(@Body() dto: CreateChallengeDto) {
        return this.service.create(dto);
    }

    @Get(':token')
    async getByToken(@Param('token') token: string) {
        const challenge = await this.service.getByToken(token);

        if (challenge.type === CaptchaType.SLIDER) {
            const result = await this.getOrRender(token, challenge.question, Number(challenge.answer));

            return {
                type: CaptchaType.SLIDER,
                pieceWidth: result.pieceWidth,
                imageWidth: result.imageWidth,
                imageHeight: result.imageHeight,
            };
        }

        return {
            type: challenge.type,
            question: challenge.question,
        };
    }

    @Get(':token/background')
    async getBackground(@Param('token') token: string, @Res() res: Response) {
        const challenge = await this.service.getByToken(token);

        if (challenge.type !== CaptchaType.SLIDER) {
            return res.status(404).json({ message: 'Not found' });
        }

        const result = await this.getOrRender(token, challenge.question, Number(challenge.answer));

        res.type('image/jpeg').send(result.background);
    }

    @Get(':token/piece')
    async getPiece(@Param('token') token: string, @Res() res: Response) {
        const challenge = await this.service.getByToken(token);

        if (challenge.type !== CaptchaType.SLIDER) {
            return res.status(404).json({ message: 'Not found' });
        }

        const result = await this.getOrRender(token, challenge.question, Number(challenge.answer));

        res.type('image/jpeg').send(result.piece);
    }

    @Post(':token/submit')
    async submit(@Param('token') token: string, @Body() dto: SubmitAnswerDto) {
        this.renderCache.delete(token);
        return this.service.submit(token, dto.answer);
    }

    private async getOrRender(token: string, filename: string, targetX: number): Promise<SliderResult> {
        const cached = this.renderCache.get(token);

        if (cached) return cached;

        const result = await this.sliderService.render(filename, targetX);
        this.renderCache.set(token, result);

        return result;
    }
}
