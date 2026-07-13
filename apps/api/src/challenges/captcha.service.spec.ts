import { CaptchaService } from './captcha.service';

describe('CaptchaService', () => {
    const service = new CaptchaService();

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

    it('produces both math and text captchas across many calls', () => {
        const types = new Set<string>();

        for (let i = 0; i < 40; i++) {
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
            } else {
                expect(type).toBe('text');
                expect(question).toMatch(/^<svg/);
                expect(question).toContain('xmlns');
                expect(answer).toMatch(/^[abcdefghjkmnpqrstuvwxyz23456789]{5}$/);
            }
        }

        expect(types.has('math')).toBe(true);
        expect(types.has('text')).toBe(true);
    });
});
