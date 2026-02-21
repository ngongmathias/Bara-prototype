import { useQuery } from '@tanstack/react-query';
import sportsApi from '../services/sportsApi';

/**
 * Hook to fetch team information
 */
export function useTeam(teamId: number | undefined, enabled = true) {
    return useQuery({
        queryKey: ['team', teamId],
        queryFn: () => sportsApi.getTeam(teamId!),
        enabled: enabled && !!teamId,
        staleTime: 24 * 60 * 60 * 1000, // Team data rarely changes, cache for 24 hours
    });
}

/**
 * Hook to fetch team statistics for a specific season
 */
export function useTeamStatistics(params: {
    teamId: number | undefined;
    league: number;
    season: number;
    enabled?: boolean;
}) {
    const { teamId, league, season, enabled = true } = params;

    return useQuery({
        queryKey: ['teamStats', teamId, league, season],
        queryFn: () => sportsApi.getTeamStatistics(teamId!, league, season),
        enabled: enabled && !!teamId,
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

/**
 * Hook to get league standings
 */
export function useStandings(params: {
    league: number;
    season: number;
    enabled?: boolean;
}) {
    const { league, season, enabled = true } = params;

    return useQuery({
        queryKey: ['standings', league, season],
        queryFn: () => sportsApi.getStandings(league, season),
        enabled,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to get top scorers for a league
 */
export function useTopScorers(params: {
    league: number;
    season: number;
    enabled?: boolean;
}) {
    const { league, season, enabled = true } = params;

    return useQuery({
        queryKey: ['topScorers', league, season],
        queryFn: () => sportsApi.getTopScorers(league, season),
        enabled,
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}
/**
 * Hook to get fixtures for a specific team
 */
export function useTeamFixtures(params: {
    teamId: number | undefined;
    season: number;
    enabled?: boolean;
}) {
    const { teamId, season, enabled = true } = params;

    return useQuery({
        queryKey: ['teamFixtures', teamId, season],
        queryFn: () => sportsApi.getFixtures({ team: teamId, season }),
        enabled: enabled && !!teamId,
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}
