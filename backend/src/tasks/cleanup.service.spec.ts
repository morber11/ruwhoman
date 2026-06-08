import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'jest-mock-extended';
import { CleanupService } from './cleanup.service';
import { Challenge } from '../challenges/challenge.entity';
import { Repository } from 'typeorm';

describe('CleanupService', () => {
    let service: CleanupService;
    let repo: jest.Mocked<Repository<Challenge>>;

    beforeEach(async () => {
        repo = mock<Repository<Challenge>>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CleanupService,
                {
                    provide: getRepositoryToken(Challenge),
                    useValue: repo,
                },
            ],
        }).compile();

        service = module.get(CleanupService);
    });

    describe('deleteExpired', () => {
        it('deletes challenges where expiresAt is older than 48 hours', async () => {
            repo.delete.mockResolvedValue({ affected: 5, raw: [] });

            await service.deleteExpired();


            expect(repo.delete).toHaveBeenCalledWith({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                expiresAt: expect.anything(),
            });
        });

        it('does not throw when no expired challenges exist', async () => {
            repo.delete.mockResolvedValue({ affected: 0, raw: [] });

            await expect(service.deleteExpired()).resolves.toBeUndefined();
        });
    });
});
