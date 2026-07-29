export const CaptchaType = {
    MATH: 'math',
    TEXT: 'text',
    SLIDER: 'slider',
    RECAPTCHA_V3: 'recaptcha-v3',
    RECAPTCHA_V2: 'recaptcha-v2',
} as const;

export type ChallengeStatus = 'pending' | 'passed' | 'failed' | 'expired';

export interface MonitorStatus {
    status: ChallengeStatus;
    createdAt: string;
    expiresAt: string;
    completedAt: string | null;
}
