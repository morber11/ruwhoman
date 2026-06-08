import { CaptchaService } from './captcha.service';

describe('CaptchaService', () => {
    const service = new CaptchaService();

    it('can do basic math', () => {
        for (let i = 0; i < 20; i++) {

            const { question, answer } = service.generate();
            const match = question.match(/What is (\d+) ([+*]) (\d+)\?/);
            expect(match).not.toBeNull();

            const a = Number(match![1]);
            const op = match![2];
            const b = Number(match![3]);
            const expected = op === '+' ? a + b : a * b;

            expect(answer).toBe(String(expected));
            expect(answer).toMatch(/^\d+$/);
        }
    });
});
