import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import sportsApi from '../services/sportsApi';
import type { Match } from '../types/sports';

interface UseLiveScoresOptions {
    league?: number;
    enabled?: boolean;
    refetchInterval?: number;
}

/**
 * Hook to fetch and auto-update live scores
 * Automatically refetches every minute
 */
export function useLiveScores(options: UseLiveScoresOptions = {}) {
    const { league, enabled = true, refetchInterval = 60000 } = options;

    return useQuery({
        queryKey: ['liveScores', league],
        queryFn: () => sportsApi.getLiveScores(league),
        enabled,
        staleTime: 30000, // Consider data stale after 30 seconds
        refetchInterval: refetchInterval, // Refetch every minute
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to fetch fixtures for a specific date and league
 */
export function useFixtures(params: {
    league?: number;
    season?: number;
    date?: string;
    enabled?: boolean;
}) {
    const { league, season, date, enabled = true } = params;

    return useQuery({
        queryKey: ['fixtures', league, season, date],
        queryFn: () => sportsApi.getFixtures({ league, season, date }),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to fetch today's fixtures
 */
export function useTodayFixtures(league?: number) {
    return useQuery({
        queryKey: ['todayFixtures', league],
        queryFn: () => sportsApi.getTodayFixtures(league),
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to fetch match details with events, statistics, and lineups
 */
export function useMatchDetails(fixtureId: number | undefined, enabled = true) {
    const matchQuery = useQuery({
        queryKey: ['match', fixtureId],
        queryFn: () => sportsApi.getMatchDetails(fixtureId!),
        enabled: enabled && !!fixtureId,
        staleTime: 30000,
    });

    const eventsQuery = useQuery({
        queryKey: ['matchEvents', fixtureId],
        queryFn: () => sportsApi.getMatchEvents(fixtureId!),
        enabled: enabled && !!fixtureId,
        staleTime: 30000,
    });

    const statsQuery = useQuery({
        queryKey: ['matchStats', fixtureId],
        queryFn: () => sportsApi.getMatchStatistics(fixtureId!),
        enabled: enabled && !!fixtureId,
        staleTime: 30000,
    });

    const lineupsQuery = useQuery({
        queryKey: ['matchLineups', fixtureId],
        queryFn: () => sportsApi.getMatchLineups(fixtureId!),
        enabled: enabled && !!fixtureId,
        staleTime: 60000, // Lineups don't change, cache for 1 minute
    });

    return {
        match: matchQuery.data,
        events: eventsQuery.data,
        statistics: statsQuery.data,
        lineups: lineupsQuery.data,
        isLoading: matchQuery.isLoading || eventsQuery.isLoading || statsQuery.isLoading || lineupsQuery.isLoading,
        error: matchQuery.error || eventsQuery.error || statsQuery.error || lineupsQuery.error,
    };
}
