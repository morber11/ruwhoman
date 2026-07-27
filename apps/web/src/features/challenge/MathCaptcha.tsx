import { useState } from 'react';
import { Button, Typography, TextField, CircularProgress } from '@mui/material';
import { useEnterSubmit } from './useEnterSubmit';

interface MathCaptchaProps {
    question: string;
    onSubmit: (answer: string) => void;
    isPending: boolean;
}

export default function MathCaptcha({ question, onSubmit, isPending }: MathCaptchaProps) {
    const [input, setInput] = useState('');

    useEnterSubmit(input, onSubmit, isPending);

    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                {question}
            </Typography>
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
