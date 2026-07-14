import { SliderService } from './slider.service';

describe('SliderService', () => {
    const service = new SliderService();

    it('generates a valid slider captcha', () => {
        const result = service.generate();

        expect(result.type).toBe('slider');
        expect(result.question).toMatch(/\.jpg$/);
        expect(result.answer).toMatch(/^\d+$/);
    });

    it('generates different results across multiple calls', () => {
        const answers = new Set<string>();

        for (let i = 0; i < 10; i++) {
            const result = service.generate();
            answers.add(result.answer);
        }

        expect(answers.size).toBeGreaterThan(1);
    });

    it('renders a slider result with buffers', async () => {
        const result = await service.render('1p.jpg', 50);

        expect(result.background).toBeInstanceOf(Buffer);
        expect(result.piece).toBeInstanceOf(Buffer);
        expect(result.pieceWidth).toBe(50);
        expect(result.imageWidth).toBe(400);
        expect(result.imageHeight).toBeGreaterThan(0);
    });
});
