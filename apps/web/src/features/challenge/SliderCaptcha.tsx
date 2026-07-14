import { useState } from 'react';
import { Box, Slider, Button, CircularProgress, Typography } from '@mui/material';
import { API_BASE } from '../../api/client';

interface SliderCaptchaProps {
    token: string;
    pieceWidth: number;
    imageWidth: number;
    onSubmit: (answer: string) => void;
    isPending: boolean;
}

export default function SliderCaptcha({ token, pieceWidth, imageWidth, onSubmit, isPending }: SliderCaptchaProps) {
    const maxX = imageWidth - pieceWidth;
    const [sliderX, setSliderX] = useState(() => Math.random() < 0.5 ? 0 : maxX);

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Slide until the image is probably aligned
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Box component="img" src={`${API_BASE}/challenges/${token}/background`} sx={{ display: 'block', maxWidth: '100%' }} />
                <Box
                    component="img"
                    src={`${API_BASE}/challenges/${token}/piece`}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: sliderX,
                        pointerEvents: 'none',
                        maxWidth: 'none',
                    }}
                />
            </Box>
            <Slider
                value={sliderX}
                onChange={(_, value) => setSliderX(value as number)}
                min={0}
                max={maxX}
                sx={{ mb: 2, mx: 'auto', maxWidth: imageWidth }}
            />
            <Button
                variant="contained"
                onClick={() => onSubmit(String(sliderX))}
                disabled={isPending}
                sx={{ gap: 1 }}
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
        </Box>
    );
}
