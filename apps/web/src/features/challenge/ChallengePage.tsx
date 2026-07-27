import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import { request, type ApiError } from '../../api/client';
import { CaptchaType } from '@ruwhoman/shared';
import SliderCaptcha from './SliderCaptcha';
import ReCaptchaChallenge from './ReCaptchaChallenge';
import TextCaptcha from './TextCaptcha';
import MathCaptcha from './MathCaptcha';

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

export default function ChallengePage() {
    const { token } = useParams<{ token: string }>();
    const queryClient = useQueryClient();

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['challenge', token],
        queryFn: () =>
            request<{
                type: string;
                question: string;
                pieceWidth?: number;
                imageWidth?: number;
            }>(`/challenges/${token!}`),
        enabled: !!token,
    });

    const mutation = useMutation<{ passed: boolean }, Error, string>({
        mutationFn: (answer: string) =>
            minDuration(
                request(`/challenges/${token!}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answer }),
                }),
                300 + Math.random() * 300,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['challenge', token],
                refetchType: 'none',
            });
        },
    });

    if (isPending) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                Loading...
            </Typography>
        );
    }

    if (isError) {
        const status = (error as ApiError).status;
        let message = 'Something went wrong';

        if (status === 404) message = 'Challenge not found or expired';
        if (status === 409) message = 'This challenge has already been completed';
        if (status === 429) message = 'You are being rate limited. Try again shortly';

        return (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                {message}
            </Typography>
        );
    }

    if (mutation.isSuccess) {
        return (
            <Typography
                variant="body1"
                sx={{
                    textAlign: 'center',
                    py: 4,
                    color: mutation.data.passed ? 'success.main' : 'error.main',
                    fontWeight: 500,
                }}
            >
                {mutation.data.passed
                    ? 'Correct! You are human'
                    : 'Wrong answer. You may be a robot'}
            </Typography>
        );
    }

    if (mutation.isError) {
        return (
            <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 4 }}>
                {(mutation.error as { status?: number }).status === 429
                    ? 'You are being rate limited. Try again shortly'
                    : 'Something went wrong submitting your answer'}
            </Typography>
        );
    }

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
            {data.type === CaptchaType.SLIDER ? (
                <SliderCaptcha
                    token={token!}
                    pieceWidth={data.pieceWidth!}
                    imageWidth={data.imageWidth!}
                    onSubmit={(answer) => mutation.mutate(answer)}
                    isPending={mutation.isPending}
                />
            ) : data.type === CaptchaType.RECAPTCHA ? (
                <ReCaptchaChallenge
                    onSubmit={(answer) => mutation.mutate(answer)}
                    isPending={mutation.isPending}
                />
            ) : data.type === CaptchaType.TEXT ? (
                <TextCaptcha
                    question={data.question}
                    onSubmit={(answer) => mutation.mutate(answer)}
                    isPending={mutation.isPending}
                />
            ) : (
                <MathCaptcha
                    question={data.question}
                    onSubmit={(answer) => mutation.mutate(answer)}
                    isPending={mutation.isPending}
                />
            )}
        </Box>
    );
}
