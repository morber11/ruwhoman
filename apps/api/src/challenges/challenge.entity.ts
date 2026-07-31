import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CaptchaType, ChallengeStatus } from '@ruwhoman/shared';

@Entity()
export class Challenge {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, length: 12 })
    challengeToken!: string;

    @Column({ unique: true, length: 32 })
    monitorToken!: string;

    @Column({ length: 20, default: CaptchaType.MATH })
    type!: string;

    @Column('text')
    question!: string;

    @Column({ length: 255 })
    answer!: string;

    @Column({ length: 10, default: ChallengeStatus.PENDING })
    status!: ChallengeStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @Column('timestamptz')
    expiresAt!: Date;

    @Column('timestamptz', { nullable: true })
    completedAt!: Date | null;

    @Column({ type: 'int', default: 1 })
    attempts!: number;

    @Column({ type: 'int', default: 1 })
    remainingAttempts!: number;
}
