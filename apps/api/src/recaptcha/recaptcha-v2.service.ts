import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VERIFY_URL } from './recaptcha.constants';

@Injectable()
export class RecaptchaV2Service {
    constructor(private readonly config: ConfigService) { }

    async verify(token: string): Promise<boolean> {
        const secret = this.config.get<string>('RECAPTCHA_V2_SECRET_KEY');
        if (!secret) return false;

        const response = await fetch(VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret, response: token }),
        });

        if (!response.ok) return false;

        const data = (await response.json()) as { success: boolean };

        return data.success;
    }
}
