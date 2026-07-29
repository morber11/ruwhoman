import { useEffect, useRef } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY;
const API_URL = 'https://www.google.com/recaptcha/api.js';

interface ReCaptchaV2ChallengeProps {
    onSubmit: (answer: string) => void;
    isPending: boolean;
}

export default function ReCaptchaV2Challenge({ onSubmit, isPending }: ReCaptchaV2ChallengeProps) {
    const elRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!SITE_KEY) return;

        if (document.querySelector('script[src*="recaptcha/api.js"]')) {
            if (window.grecaptcha && elRef.current) {
                window.grecaptcha.render(elRef.current, { sitekey: SITE_KEY });
            }
            return;
        }

        const s = document.createElement('script');
        s.src = API_URL;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
    }, []);

    const handleSubmit = () => {
        const token = window.grecaptcha?.getResponse();
        if (token) onSubmit(token);
    };

    if (!SITE_KEY) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                reCAPTCHA v2 is not configured.
            </Typography>
        );
    }

    return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Verify with reCAPTCHA v2
            </Typography>
            <div ref={elRef} className="g-recaptcha" data-sitekey={SITE_KEY} />
            <Box sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isPending}
                    sx={{ gap: 1 }}
                >
                    {isPending ? (
                        <>
                            <CircularProgress size={16} color="inherit" />
                            Verifying...
                        </>
                    ) : (
                        'Submit'
                    )}
                </Button>
            </Box>
        </Box>
    );
}
