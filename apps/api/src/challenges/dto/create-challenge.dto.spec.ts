import { validate } from 'class-validator';
import { CreateChallengeDto } from './create-challenge.dto';

describe('CreateChallengeDto', () => {
    it.each([0, 11, 2.5])('rejects attempts=%d', async (attempts) => {
        const dto = new CreateChallengeDto();
        dto.attempts = attempts;

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
    });

    it('accepts attempts within bounds', async () => {
        const dto = new CreateChallengeDto();
        dto.attempts = 3;

        expect(await validate(dto)).toHaveLength(0);
    });

    it('accepts a missing attempts', async () => {
        const dto = new CreateChallengeDto();

        expect(await validate(dto)).toHaveLength(0);
    });
});
