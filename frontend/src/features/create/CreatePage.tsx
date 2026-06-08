import { Button, Typography, Box, Snackbar, IconButton, CircularProgress } from '@mui/material';
import ContentCopy from '@mui/icons-material/ContentCopy';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useState } from 'react';
import debounce from '@mui/utils/debounce';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../api/client';
import { MonitorStatusCard } from '../monitor/MonitorStatusCard';

const minDuration = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    const start = Date.now();
    return promise.then((result) => {
        const elapsed = Date.now() - start;
        if (elapsed >= ms) return result;
        return new Promise<T>((resolve) =>
            setTimeout(() => resolve(result), ms - elapsed),
        );
    });
};

export default function CreatePage() {
    const [copied, setCopied] = useState(false);
    const queryClient = useQueryClient();

    const mutation = useMutation<{ challengeUrl: string; monitorUrl: string }>({
        mutationFn: () =>
            minDuration(
                request('/challenges', {
                    method: 'POST',
                }),
                300 + Math.random() * 300,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge'] });
        },
    });

    const writeClipboard = debounce((url: string) => {
        navigator.clipboard.writeText(url);
    }, 300);

    const copyUrl = (url: string) => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        writeClipboard(url);
    };

    const monitorToken = mutation.isSuccess
        ? mutation.data.monitorUrl.split('/monitor/')[1]
        : null;

    return (
        <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Verify if someone is human
            </Typography>
            <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}
            >
                Create a challenge to verify if someone is a human or if they're a bot. Share the link
                and monitor the result
            </Typography>

            {mutation.isPending ? (
                <Button variant="contained" disabled sx={{ gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    Creating...
                </Button>
            ) : (
                <Button
                    variant="contained"
                    onClick={() => mutation.mutate()}
                >
                    Create a Challenge
                </Button>
            )}

            {mutation.isError && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                    {(mutation.error as { status?: number }).status === 429
                        ? 'You are being rate limited. Try again shortly'
                        : 'Failed to create challenge. Try again'}
                </Typography>
            )}

            {mutation.isSuccess && (
                <Box
                    sx={{
                        mt: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                    }}
                >
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'text.secondary',
                                display: 'block',
                                mb: 0.75,
                            }}
                        >
                            Challenge link
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 500,
                                    fontSize: '0.8125rem',
                                    wordBreak: 'break-all',
                                    flex: 1,
                                }}
                            >
                                {mutation.data.challengeUrl}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() =>
                                    copyUrl(mutation.data.challengeUrl)
                                }
                                sx={{ flexShrink: 0 }}
                            >
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'text.secondary',
                                display: 'block',
                                mb: 0.75,
                            }}
                        >
                            Monitor link
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            <Typography
                                variant="body2"
                                onClick={() =>
                                    window.open(
                                        mutation.data.monitorUrl,
                                        '_blank',
                                    )
                                }
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 500,
                                    fontSize: '0.8125rem',
                                    wordBreak: 'break-all',
                                    flex: 1,
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                {mutation.data.monitorUrl}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() =>
                                    window.open(
                                        mutation.data.monitorUrl,
                                        '_blank',
                                    )
                                }
                                sx={{ flexShrink: 0 }}
                            >
                                <OpenInNew fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                    {monitorToken && <MonitorStatusCard token={monitorToken} />}
                </Box>
            )}

            <Snackbar
                open={copied}
                autoHideDuration={1500}
                onClose={() => setCopied(false)}
                message="Copied to clipboard"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
}
