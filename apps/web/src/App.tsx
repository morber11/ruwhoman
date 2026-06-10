import { lazy, Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Skeleton, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

const CreatePage = lazy(() => import('./features/create/CreatePage'));
const ChallengePage = lazy(() => import('./features/challenge/ChallengePage'));
const MonitorPage = lazy(() => import('./features/monitor/MonitorPage'));
const NotFoundPage = lazy(() => import('./features/not-found/NotFoundPage'));

const theme = createTheme({
    palette: {
        primary: { main: '#1a73e8' },
        background: { default: '#ffffff' },
        text: {
            primary: '#111827',
            secondary: '#6b7280',
        },
        error: { main: '#ef4444' },
        warning: { main: '#f59e0b' },
        success: { main: '#16a34a' },
    },
    typography: {
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    },
    shape: { borderRadius: 6 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 500 },
            },
        },
    },
});

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <header className="header">
                        <div className="header__inner">
                            <Link
                                to="/"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    textDecoration: 'none',
                                }}
                            >
                                <img
                                    src="/clanker.svg"
                                    alt=""
                                    width={28}
                                    height={28}
                                    style={{ flexShrink: 0 }}
                                />
                                <span className="header__title">
                                    R U Who, Man?
                                </span>
                            </Link>
                        </div>
                    </header>
                    <main className="container">
                        {/* error boundary might be overkill but oh well */}
                        <ErrorBoundary>
                            <Suspense fallback={
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 8 }}>
                                    <Skeleton variant="rounded" height={120} />
                                    <Skeleton variant="rounded" height={56} />
                                    <Skeleton variant="rounded" height={48} />
                                </Box>
                            }>
                                <Routes>
                                    <Route path="/" element={<CreatePage />} />
                                    <Route path="/monitor/:token" element={<MonitorPage />} />
                                    <Route path="/:token" element={<ChallengePage />} />
                                    <Route path="*" element={<NotFoundPage />} />
                                </Routes>
                            </Suspense>
                        </ErrorBoundary>
                    </main>
                </BrowserRouter>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
