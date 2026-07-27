export const CaptchaType = {
    MATH: 'math',
    TEXT: 'text',
    SLIDER: 'slider',
    RECAPTCHA: 'recaptcha',
} as const;

export type ChallengeStatus = 'pending' | 'passed' | 'failed' | 'expired';

export interface MonitorStatus {
    status: ChallengeStatus;
    createdAt: string;
    expiresAt: string;
    completedAt: string | null;
}
