import { useEffect } from 'react';

export function useEnterSubmit(
    input: string,
    onSubmit: (value: string) => void,
    isPending: boolean,
) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && input.trim() && !isPending) {
                onSubmit(input);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [input, onSubmit, isPending]);
}
