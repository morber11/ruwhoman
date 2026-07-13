export const CAPTCHA_TYPE_MATH = 'math';
export const CAPTCHA_TYPE_TEXT = 'text';

export type ChallengeStatus = 'pending' | 'passed' | 'failed' | 'expired';

export interface MonitorStatus {
    status: ChallengeStatus;
    createdAt: string;
    expiresAt: string;
    completedAt: string | null;
}
