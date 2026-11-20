import { useEffect } from 'react';

// Calls onEscape when Escape is pressed while `active` is true.
export function useEscapeKey(onEscape: () => void, active = true) {
    useEffect(() => {
        if (!active) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onEscape();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onEscape, active]);
}
