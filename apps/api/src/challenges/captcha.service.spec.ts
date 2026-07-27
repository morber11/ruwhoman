import { CaptchaService } from './captcha.service';
import { SliderService } from './slider.service';

describe('CaptchaService', () => {
    const sliderService = new SliderService();
    const service = new CaptchaService(sliderService);

    it('always returns math when forced', () => {
        for (let i = 0; i < 10; i++) {
            const { type, question, answer } = service.generate('math');

            expect(type).toBe('math');
            const match = question.match(/What is (\d+) ([+*]) (\d+)\?/);
            expect(match).not.toBeNull();
            expect(answer).toMatch(/^\d+$/);
        }
    });

    it('always returns text when forced', () => {
        for (let i = 0; i < 10; i++) {
            const { type, question, answer } = service.generate('text');

            expect(type).toBe('text');
            expect(question).toMatch(/^<svg/);
            expect(answer).toMatch(/^[abcdefghjkmnpqrstuvwxyz23456789]{5}$/);
        }
    });

    it('always returns slider when forced', () => {
        const result = service.generate('slider');

        expect(result.type).toBe('slider');
        expect(result.question).toMatch(/\.jpg$/);
        expect(result.answer).toMatch(/^\d+$/);
    });

    it('always returns recaptcha when forced', () => {
        const { type, question, answer } = service.generate('recaptcha');

        expect(type).toBe('recaptcha');
        expect(question).toBe('');
        expect(answer).toBe('');
    });

    it('cycles through all captcha types in round-robin', () => {
        const types = new Set<string>();

        for (let i = 0; i < 40; i++) {
            types.add(service.generate().type);
        }

        expect(types.has('math')).toBe(true);
        expect(types.has('text')).toBe(true);
        expect(types.has('slider')).toBe(true);
        expect(types.has('recaptcha')).toBe(true);
    });
});
