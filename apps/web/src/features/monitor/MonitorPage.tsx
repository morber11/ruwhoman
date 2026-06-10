import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { MonitorStatusCard } from './MonitorStatusCard';

export default function MonitorPage() {
    const { token } = useParams<{ token: string }>();

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <MonitorStatusCard token={token!} />
        </Box>
    );
}
