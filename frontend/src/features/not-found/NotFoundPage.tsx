import { Typography, Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Page not found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                The link you followed may be broken or the page has been removed
            </Typography>
            <Link component={RouterLink} to="/" variant="body2">
                Go home
            </Link>
        </Box>
    );
}
