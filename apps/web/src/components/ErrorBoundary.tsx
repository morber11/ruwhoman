import { Component } from 'react';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    countdown: number;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, countdown: 5 };
    private timer: ReturnType<typeof setInterval> | null = null;

    static getDerivedStateFromError(): State {
        return { hasError: true, countdown: 5 };
    }

    componentDidCatch() {
        this.timer = setInterval(() => {
            this.setState((prev) => {
                if (prev.countdown <= 1) {
                    if (this.timer) clearInterval(this.timer);
                    window.location.href = '/';
                }
                return { countdown: prev.countdown - 1 };
            });
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Something went wrong
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Redirecting to home page in {this.state.countdown}...
                    </Typography>
                </Box>
            );
        }

        return this.props.children;
    }
}
