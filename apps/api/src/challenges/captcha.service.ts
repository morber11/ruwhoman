import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { join } from 'path';
import { CAPTCHA_TYPE_MATH, CAPTCHA_TYPE_TEXT } from '@ruwhoman/shared';

interface MathCaptcha {
    type: typeof CAPTCHA_TYPE_MATH;
    question: string;
    answer: string;
}

interface TextCaptcha {
    type: typeof CAPTCHA_TYPE_TEXT;
    question: string;
    answer: string;
}

type Captcha = MathCaptcha | TextCaptcha;

@Injectable()
export class CaptchaService {
    private readonly fonts = [
        join(__dirname, 'fonts', 'Inconsolata.ttf'),
        join(__dirname, 'fonts', 'SourceCodePro.ttf'),
        join(__dirname, 'fonts', 'SpaceMono.ttf'),
    ];

    private nextIsMath = Math.random() < 0.5;

    private nextType() {
        this.nextIsMath = !this.nextIsMath;
        return this.nextIsMath ? CAPTCHA_TYPE_MATH : CAPTCHA_TYPE_TEXT;
    }

    generate(type?: string): Captcha {
        const resolvedType = type ?? this.nextType();

        if (resolvedType === CAPTCHA_TYPE_MATH) {
            const a = Math.floor(Math.random() * 12) + 1;
            const b = Math.floor(Math.random() * 12) + 1;

            const op = Math.random() < 0.5 ? '+' : '*';
            const answer = op === '+' ? a + b : a * b;

            return {
                type: CAPTCHA_TYPE_MATH,
                question: `What is ${a} ${op} ${b}?`,
                answer: String(answer),
            };
        }

        const fontPath = this.fonts[Math.floor(Math.random() * this.fonts.length)];
        svgCaptcha.loadFont(fontPath);

        const captcha = svgCaptcha.create({ size: 5, noise: 2, color: true, charPreset: 'abcdefghjkmnpqrstuvwxyz23456789' });

        // fallback is text captcha, maybe consider making this explicit
        return {
            type: CAPTCHA_TYPE_TEXT,
            question: captcha.data,
            answer: captcha.text,
        };
    }
}
