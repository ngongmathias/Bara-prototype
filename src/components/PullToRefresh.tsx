import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void> | void;
    children: React.ReactNode;
    threshold?: number;
    disabled?: boolean;
}

const THRESHOLD = 70;
const MAX_PULL = 120;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    children,
    threshold = THRESHOLD,
    disabled = false,
}) => {
    const [pull, setPull] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const startYRef = useRef<number | null>(null);
    const activeRef = useRef(false);

    useEffect(() => {
        if (disabled) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (refreshing) return;
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            if (scrollY > 0) return;
            startYRef.current = e.touches[0].clientY;
            activeRef.current = true;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!activeRef.current || startYRef.current === null) return;
            const dy = e.touches[0].clientY - startYRef.current;
            if (dy <= 0) {
                setPull(0);
                return;
            }
            const resisted = Math.min(MAX_PULL, dy * 0.5);
            setPull(resisted);
        };

        const handleTouchEnd = async () => {
            if (!activeRef.current) return;
            activeRef.current = false;
            startYRef.current = null;
            if (pull >= threshold && !refreshing) {
                setRefreshing(true);
                setPull(threshold);
                try {
                    await onRefresh();
                } finally {
                    setRefreshing(false);
                    setPull(0);
                }
            } else {
                setPull(0);
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [pull, refreshing, threshold, onRefresh, disabled]);

    const triggered = pull >= threshold;

    return (
        <div style={{ transform: `translateY(${pull}px)`, transition: activeRef.current ? 'none' : 'transform 250ms ease-out' }}>
            <div
                className="flex items-center justify-center pointer-events-none"
                style={{
                    position: 'absolute',
                    top: -60,
                    left: 0,
                    right: 0,
                    height: 60,
                    opacity: Math.min(1, pull / threshold),
                }}
            >
                {refreshing ? (
                    <Loader2 className="w-6 h-6 text-[#1DB954] animate-spin" />
                ) : (
                    <ArrowDown
                        className={`w-6 h-6 transition-transform ${triggered ? 'text-[#1DB954] rotate-180' : 'text-gray-400'}`}
                    />
                )}
            </div>
            {children}
        </div>
    );
};
