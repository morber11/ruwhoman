const BASE = import.meta.env.VITE_API_URL;

if (!BASE) {
    throw new Error('VITE_API_URL is not set');
}

export class ApiError extends Error {
    status: number;

    constructor(status: number) {
        super(String(status));
        this.status = status;
    }
}

export type { ChallengeStatus, MonitorStatus } from '@ruwhoman/shared';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, init);

    if (!res.ok) throw new ApiError(res.status);

    return res.json() as Promise<T>;
}
