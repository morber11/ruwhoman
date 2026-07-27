import { useState } from 'react';
import { Button, TextField, Box, CircularProgress } from '@mui/material';
import { useEnterSubmit } from './useEnterSubmit';

const svgToDataUri = (svg: string) =>
    `data:image/svg+xml;base64,${btoa(
        String.fromCharCode(...new Uint8Array(new TextEncoder().encode(svg))),
    )}`;

interface TextCaptchaProps {
    question: string;
    onSubmit: (answer: string) => void;
    isPending: boolean;
}

export default function TextCaptcha({ question, onSubmit, isPending }: TextCaptchaProps) {
    const [input, setInput] = useState('');

    useEnterSubmit(input, onSubmit, isPending);

    return (
        <>
            <Box
                component="img"
                src={svgToDataUri(question)}
                alt="Captcha"
                sx={{ mb: 2, display: 'block', mx: 'auto', maxWidth: '100%' }}
            />
            <TextField
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isPending}
                placeholder="Enter your answer"
                size="small"
                sx={{ mb: 2 }}
            />
            <Button
                variant="contained"
                onClick={() => onSubmit(input)}
                disabled={isPending || !input.trim()}
                sx={{ gap: 1.5 }}
            >
                {isPending ? (
                    <>
                        <CircularProgress size={16} color="inherit" />
                        Submitting...
                    </>
                ) : (
                    'Submit'
                )}
            </Button>
        </>
    );
}
