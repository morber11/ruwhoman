import { Injectable } from '@nestjs/common';

interface Captcha {
    type: 'math';
    question: string;
    answer: string;
}

@Injectable()
export class CaptchaService {
    generate(): Captcha {
        // MVP we'll just do a simple math captcha
        const a = Math.floor(Math.random() * 12) + 1;
        const b = Math.floor(Math.random() * 12) + 1;
        const op = Math.random() < 0.5 ? '+' : '*';
        const answer = op === '+' ? a + b : a * b;

        return {
            type: 'math',
            question: `What is ${a} ${op} ${b}?`,
            answer: String(answer),
        };
    }
}
