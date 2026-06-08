const BASE = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    status: number;

    constructor(status: number) {
        super(String(status));
        this.status = status;
    }
}

export type ChallengeStatus = 'pending' | 'passed' | 'failed' | 'expired';

export interface MonitorStatus {
    status: ChallengeStatus;
    createdAt: string;
    expiresAt: string;
    completedAt: string | null;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, init);

    if (!res.ok) throw new ApiError(res.status);
    
    return res.json() as Promise<T>;
}
