import { useQuery } from '@tanstack/react-query';
import { Typography, Box, Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { request } from '../../api/client';
import type { MonitorStatus } from '../../api/client';

const STATUS_LABEL: Record<string, string> = {
    pending: 'Waiting for response',
    passed: 'Human verified',
    failed: 'Verification failed',
    expired: 'Link expired',
};

const STATUS_COLOR: Record<string, ChipProps['color']> = {
    pending: 'warning',
    passed: 'success',
    failed: 'error',
    expired: 'default',
};

export function MonitorStatusCard({ token }: { token: string }) {
    const { data, isPending, isError } = useQuery({
        queryKey: ['monitor', token],
        queryFn: () => request<MonitorStatus>(`/monitor/${token}`),
        refetchInterval: (q) =>
            q.state.data?.status === 'pending' ? 5000 : false,
    });

    if (isPending) return null;

    if (isError) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                Failed to load status
            </Typography>
        );
    }

    const { status, createdAt, expiresAt, completedAt } = data!;

    return (
        <Box sx={{ pt: 1, textAlign: 'center' }}>
            <Chip
                label={STATUS_LABEL[status] ?? status}
                color={STATUS_COLOR[status] ?? 'default'}
                variant="filled"
            />
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'block' }}>
                        Created
                    </Typography>
                    <Typography variant="body2">
                        {new Date(createdAt).toLocaleString()}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'block' }}>
                        Expires
                    </Typography>
                    <Typography variant="body2">
                        {new Date(expiresAt).toLocaleString()}
                    </Typography>
                </Box>
                {completedAt && (
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'block' }}>
                            Completed
                        </Typography>
                        <Typography variant="body2">
                            {new Date(completedAt).toLocaleString()}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
