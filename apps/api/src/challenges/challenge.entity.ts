import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

export type ChallengeStatus = 'pending' | 'passed' | 'failed';

@Entity()
export class Challenge {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, length: 12 })
    challengeToken!: string;

    @Column({ unique: true, length: 32 })
    monitorToken!: string;

    @Column({ length: 20, default: 'math' })
    type!: string;

    @Column('text')
    question!: string;

    @Column({ length: 255 })
    answer!: string;

    @Column({ length: 10, default: 'pending' })
    status!: ChallengeStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @Column('timestamptz')
    expiresAt!: Date;

    @Column('timestamptz', { nullable: true })
    completedAt!: Date | null;
}
