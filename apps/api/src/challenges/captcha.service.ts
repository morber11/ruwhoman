import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { join } from 'path';
import { SliderService } from './slider.service';
import { CaptchaType } from '@ruwhoman/shared';

interface MathCaptcha {
    type: typeof CaptchaType.MATH;
    question: string;
    answer: string;
}

interface TextCaptcha {
    type: typeof CaptchaType.TEXT;
    question: string;
    answer: string;
}

interface SliderCaptcha {
    type: typeof CaptchaType.SLIDER;
    question: string;
    answer: string;
}

interface RecaptchaCaptcha {
    type: typeof CaptchaType.RECAPTCHA;
    question: string;
    answer: string;
}

type Captcha = MathCaptcha | TextCaptcha | SliderCaptcha | RecaptchaCaptcha;

@Injectable()
export class CaptchaService {
    private readonly fonts = [
        join(__dirname, 'fonts', 'Inconsolata.ttf'),
        join(__dirname, 'fonts', 'SourceCodePro.ttf'),
        join(__dirname, 'fonts', 'SpaceMono.ttf'),
    ];

    private typeIndex = 0;
    private readonly types = Object.values(CaptchaType);

    constructor(private readonly sliderService: SliderService) { }

    private nextType() {
        return this.types[this.typeIndex++ % this.types.length];
    }

    generate(type?: string): Captcha {
        const resolvedType = type ?? this.nextType();

        if (resolvedType === CaptchaType.MATH) {
            const a = Math.floor(Math.random() * 12) + 1;
            const b = Math.floor(Math.random() * 12) + 1;

            const op = Math.random() < 0.5 ? '+' : '*';
            const answer = op === '+' ? a + b : a * b;

            return {
                type: CaptchaType.MATH,
                question: `What is ${a} ${op} ${b}?`,
                answer: String(answer),
            };
        }

        if (resolvedType === CaptchaType.SLIDER) {
            return this.sliderService.generate();
        }

        if (resolvedType === CaptchaType.TEXT) {
            const fontPath = this.fonts[Math.floor(Math.random() * this.fonts.length)];
            svgCaptcha.loadFont(fontPath);

            const captcha = svgCaptcha.create({ size: 5, noise: 2, color: true, charPreset: 'abcdefghjkmnpqrstuvwxyz23456789' });

            return {
                type: CaptchaType.TEXT,
                question: captcha.data,
                answer: captcha.text,
            };
        }

        if (resolvedType === CaptchaType.RECAPTCHA) {
            return {
                type: CaptchaType.RECAPTCHA,
                question: '',
                answer: '',
            };
        }

        throw new Error(`unknown captcha type: ${resolvedType}`);
    }
}
