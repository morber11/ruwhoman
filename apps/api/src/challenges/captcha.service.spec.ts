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

    it('returns all three types across many calls', () => {
        const types = new Set<string>();

        for (let i = 0; i < 30; i++) {
            const { type, question, answer } = service.generate();
            types.add(type);

            if (type === 'math') {
                const match = question.match(/What is (\d+) ([+*]) (\d+)\?/);
                expect(match).not.toBeNull();
                const a = Number(match![1]);
                const op = match![2];
                const b = Number(match![3]);
                const expected = op === '+' ? a + b : a * b;
                expect(answer).toBe(String(expected));
                expect(answer).toMatch(/^\d+$/);
            } else if (type === 'text') {
                expect(question).toMatch(/^<svg/);
                expect(answer).toMatch(/^[abcdefghjkmnpqrstuvwxyz23456789]{5}$/);
            } else {
                expect(type).toBe('slider');
                expect(answer).toMatch(/^\d+$/);
            }
        }

        expect(types.has('math')).toBe(true);
        expect(types.has('text')).toBe(true);
        expect(types.has('slider')).toBe(true);
    });
});
