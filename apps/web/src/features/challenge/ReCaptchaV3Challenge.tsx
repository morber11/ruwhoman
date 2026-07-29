import { useEffect, useState, useRef } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
const RECAPTCHA_API_URL = 'https://www.google.com/recaptcha/api.js';

interface ReCaptchaV3ChallengeProps {
    onSubmit: (answer: string) => void;
    isPending: boolean;
}

export default function ReCaptchaV3Challenge({ onSubmit, isPending }: ReCaptchaV3ChallengeProps) {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [scriptError, setScriptError] = useState(false);
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;

        const existing = document.querySelector(`script[src*="recaptcha/api.js"]`);

        if (existing && window.grecaptcha) {
            window.grecaptcha.ready(() => {
                if (mountedRef.current) setScriptLoaded(true);
            });
            return;
        }

        if (!existing) {
            const script = document.createElement('script');
            script.src = `${RECAPTCHA_API_URL}?render=${SITE_KEY}`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                window.grecaptcha!.ready(() => {
                    if (mountedRef.current) setScriptLoaded(true);
                });
            };
            script.onerror = () => {
                if (mountedRef.current) setScriptError(true);
            };
            document.head.appendChild(script);
        }

        return () => {
            mountedRef.current = false;
        };
    }, []);

    const handleVerify = () => {
        window.grecaptcha!.ready(() => {
            window.grecaptcha!
                .execute(SITE_KEY, { action: 'challenge' })
                .then((token) => onSubmit(token))
                .catch(() => setScriptError(true));
        });
    };

    return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Verify with reCAPTCHA v3
            </Typography>
            {scriptError && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    Failed to load reCAPTCHA v3. Check your connection and try again
                </Typography>
            )}
            {!SITE_KEY ? (
                <Typography variant="body2" color="text.secondary">
                    reCAPTCHA v3 is not configured. Set <code>VITE_RECAPTCHA_V3_SITE_KEY</code> in your environment.
                </Typography>
            ) : !scriptLoaded && !scriptError ? (
                <CircularProgress size={24} />
            ) : (
                <Button
                    variant="contained"
                    onClick={handleVerify}
                    disabled={isPending || scriptError}
                    sx={{ gap: 1 }}
                >
                    {isPending ? (
                        <>
                            <CircularProgress size={16} color="inherit" />
                            Verifying...
                        </>
                    ) : (
                        'Verify'
                    )}
                </Button>
            )}
        </Box>
    );
}
