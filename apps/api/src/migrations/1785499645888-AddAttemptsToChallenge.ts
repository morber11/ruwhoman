import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttemptsToChallenge1785499645888 implements MigrationInterface {
    name = 'AddAttemptsToChallenge1785499645888';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "challenge"
                ADD "attempts" integer NOT NULL DEFAULT 1,
                ADD "remainingAttempts" integer NOT NULL DEFAULT 1;
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "challenge"
                DROP COLUMN "attempts",
                DROP COLUMN "remainingAttempts";
        `);
    }
}
