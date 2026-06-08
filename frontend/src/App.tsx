import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import CreatePage from './features/create/CreatePage';
import ChallengePage from './features/challenge/ChallengePage';
import MonitorPage from './features/monitor/MonitorPage';

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
                            <Routes>
                                <Route path="/" element={<CreatePage />} />
                                <Route path="/monitor/:token" element={<MonitorPage />} />
                                <Route path="/:token" element={<ChallengePage />} />
                            </Routes>
                        </ErrorBoundary>
                    </main>
                </BrowserRouter>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
