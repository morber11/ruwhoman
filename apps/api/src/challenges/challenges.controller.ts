import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('challenges')
export class ChallengesController {
    constructor(private readonly service: ChallengesService) { }

    @Post()
    create() {
        return this.service.create();
    }

    @Get(':token')
    async getByToken(@Param('token') token: string) {
        const challenge = await this.service.getByToken(token);
        return {
            type: challenge.type,
            question: challenge.question,
        };
    }

    @Post(':token/submit')
    submit(@Param('token') token: string, @Body() dto: SubmitAnswerDto) {
        return this.service.submit(token, dto.answer);
    }
}
