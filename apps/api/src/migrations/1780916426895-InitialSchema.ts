import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1780916426895 implements MigrationInterface {
    name = 'InitialSchema1780916426895';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "challenge" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "challengeToken" character varying(12) NOT NULL,
                "monitorToken" character varying(32) NOT NULL,
                "type" character varying(20) NOT NULL DEFAULT 'math',
                "question" text NOT NULL,
                "answer" character varying(255) NOT NULL,
                "status" character varying(10) NOT NULL DEFAULT 'pending',
                "createdAt" timestamptz NOT NULL DEFAULT now(),
                "expiresAt" timestamptz NOT NULL,
                "completedAt" timestamptz,
                CONSTRAINT "UQ_challengeToken" UNIQUE ("challengeToken"),
                CONSTRAINT "UQ_monitorToken" UNIQUE ("monitorToken")
            );
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "challenge"`);
    }
}
