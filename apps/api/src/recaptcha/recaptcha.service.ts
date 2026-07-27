import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecaptchaService {
    constructor(private readonly config: ConfigService) { }

    async verify(token: string): Promise<boolean> {
        const secret = this.config.get<string>('RECAPTCHA_SECRET_KEY');
        if (!secret) return false;

        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret, response: token }),
        });

        if (!response.ok) return false;

        const data = (await response.json()) as {
            success: boolean;
            score?: number;
        };

        return data.success && (data.score ?? 0) >= 0.5;
    }
}
