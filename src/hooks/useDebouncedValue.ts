import { useEffect, useState } from 'react';

// Shared debounce for search inputs — SearchPage, MusicSearchPage, and the
// marketplace SearchResults page each used to hand-roll their own
// setTimeout/clearTimeout debounce for this exact purpose (STREAMS_MASTER_PLAN.md §J4).
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(t);
    }, [value, delayMs]);

    return debounced;
}
