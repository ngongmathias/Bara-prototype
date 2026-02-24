import type { ApiResponse, Match, Standing, MatchEvent, MatchStatistic, Lineup, Team, Player } from '../types/sports';

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || '';

if (!API_KEY) {
    console.warn('[SportsAPI] VITE_API_FOOTBALL_KEY is not set. Sports features will not work.');
}

const SPORT_BASE_URLS: Record<string, string> = {
    football: 'https://v3.football.api-sports.io',
    nba: 'https://v1.nba.api-sports.io',
    basketball: 'https://v1.basketball.api-sports.io',
    baseball: 'https://v1.baseball.api-sports.io',
    nfl: 'https://v1.nfl.api-sports.io',
    'american-football': 'https://v1.american-football.api-sports.io',
    rugby: 'https://v1.rugby.api-sports.io',
    mma: 'https://v1.mma.api-sports.io',
    f1: 'https://v1.formula-1.api-sports.io',
    'formula-1': 'https://v1.formula-1.api-sports.io',
    handball: 'https://v1.handball.api-sports.io',
    hockey: 'https://v1.hockey.api-sports.io',
    volleyball: 'https://v1.volleyball.api-sports.io',
    cricket: 'https://v1.cricket.api-sports.io', // Placeholder, not currently supported by api-sports.io
};

// Endpoints mapping by sport
const SPORT_ENDPOINTS: Record<string, { fixtures: string; events?: string; statistics?: string; lineups?: string }> = {
    football: { fixtures: '/fixtures', events: '/fixtures/events', statistics: '/fixtures/statistics', lineups: '/fixtures/lineups' },
    nba: { fixtures: '/games', statistics: '/games/statistics' },
    basketball: { fixtures: '/games', statistics: '/games/statistics' },
    nfl: { fixtures: '/games', statistics: '/games/statistics' },
    'american-football': { fixtures: '/games', statistics: '/games/statistics' },
    baseball: { fixtures: '/games', statistics: '/games/statistics' },
    rugby: { fixtures: '/games', statistics: '/games/statistics' },
    mma: { fixtures: '/fights' },
    f1: { fixtures: '/races' },
    'formula-1': { fixtures: '/races' },
    hockey: { fixtures: '/games', statistics: '/games/statistics' },
    handball: { fixtures: '/games' },
    volleyball: { fixtures: '/games' },
    cricket: { fixtures: '/fixtures' },
};

class SportsApiService {
    private headers: HeadersInit;

    constructor() {
        this.headers = {
            'x-apisports-key': API_KEY,
            'Content-Type': 'application/json',
        };
    }

    private getBaseUrl(sport: string = 'football'): string {
        return SPORT_BASE_URLS[sport] || SPORT_BASE_URLS.football;
    }

    private getEndpoint(type: 'fixtures' | 'events' | 'statistics' | 'lineups', sport: string = 'football'): string {
        const config = SPORT_ENDPOINTS[sport] || SPORT_ENDPOINTS.football;
        return config[type] || SPORT_ENDPOINTS.football[type] || '/fixtures';
    }

    private async fetch<T>(endpoint: string, params: Record<string, any> = {}, sport: string = 'football'): Promise<ApiResponse<T>> {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null)
        ).toString();

        const baseUrl = this.getBaseUrl(sport);
        const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

        if (!API_KEY) {
            throw new Error('SPORTS_API_NO_KEY');
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers,
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('SPORTS_API_FORBIDDEN');
                }
                if (response.status === 429) {
                    throw new Error('SPORTS_API_RATE_LIMITED');
                }
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Check for API-level errors in the response body
            if (data.errors) {
                const errorKeys = Array.isArray(data.errors) ? data.errors : Object.keys(data.errors);
                if (errorKeys.length > 0) {
                    const errorStr = JSON.stringify(data.errors);
                    console.warn('[SportsAPI] API returned errors:', errorStr);
                    if (errorStr.toLowerCase().includes('suspended')) {
                        throw new Error('SPORTS_API_SUSPENDED');
                    }
                    if (errorStr.toLowerCase().includes('token') || errorStr.toLowerCase().includes('key')) {
                        throw new Error('SPORTS_API_INVALID_KEY');
                    }
                    throw new Error(`API returned errors: ${errorStr}`);
                }
            }

            return data;
        } catch (error: any) {
            // Re-throw known error types
            if (error.message?.startsWith('SPORTS_API_')) throw error;

            // Handle CORS / network errors gracefully
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('[SportsAPI] Network/CORS error — the API may be blocked by browser CORS policy. Consider using a proxy.');
                throw new Error('SPORTS_API_NETWORK_ERROR');
            }

            console.error('[SportsAPI] Fetch error:', error);
            throw error;
        }
    }

    // Get live and upcoming fixtures for a specific league
    async getFixtures(params: {
        league?: number;
        season?: number;
        team?: number;
        date?: string; // YYYY-MM-DD
        live?: 'all' | string;
        timezone?: string;
    }, sport: string = 'football'): Promise<Match[]> {
        const endpoint = this.getEndpoint('fixtures', sport);
        const response = await this.fetch<Match[]>(endpoint, params, sport);
        return response.response;
    }

    // Get live scores across all leagues
    async getLiveScores(league?: number, sport: string = 'football'): Promise<Match[]> {
        const params: any = { live: 'all' };
        if (league) params.league = league;

        const endpoint = this.getEndpoint('fixtures', sport);
        const response = await this.fetch<Match[]>(endpoint, params, sport);
        return response.response;
    }

    // Get detailed information about a specific match
    async getMatchDetails(fixtureId: number): Promise<Match> {
        const response = await this.fetch<Match[]>('/fixtures', { id: fixtureId });
        return response.response[0];
    }

    // Get match events (goals, cards, substitutions)
    async getMatchEvents(fixtureId: number, sport: string = 'football'): Promise<MatchEvent[]> {
        const endpoint = this.getEndpoint('events', sport);
        const response = await this.fetch<MatchEvent[]>(endpoint, { fixture: fixtureId }, sport);
        return response.response;
    }

    // Get match statistics
    async getMatchStatistics(fixtureId: number, sport: string = 'football'): Promise<MatchStatistic[]> {
        const endpoint = this.getEndpoint('statistics', sport);
        // Some APIs use 'fixture', some use 'id'
        const params = sport === 'football' ? { fixture: fixtureId } : { id: fixtureId };
        const response = await this.fetch<MatchStatistic[]>(endpoint, params, sport);
        return response.response;
    }

    // Get match lineups
    async getMatchLineups(fixtureId: number, sport: string = 'football'): Promise<Lineup[]> {
        const endpoint = this.getEndpoint('lineups', sport);
        const response = await this.fetch<Lineup[]>(endpoint, { fixture: fixtureId }, sport);
        return response.response;
    }

    // Get league standings
    async getStandings(league: number, season: number): Promise<Standing[]> {
        const response = await this.fetch<Array<{ league: any; standings: Standing[][] }>>('/standings', {
            league,
            season,
        });

        // API returns nested structure, flatten it
        if (response.response.length > 0 && response.response[0].league.standings) {
            return response.response[0].league.standings[0];
        }
        return [];
    }

    // Get team information
    async getTeam(teamId: number): Promise<any> {
        const response = await this.fetch<any[]>('/teams', { id: teamId });
        if (response.response.length > 0) {
            const { team, venue } = response.response[0];
            return { ...team, venue };
        }
        return null;
    }

    // Get team statistics for a season
    async getTeamStatistics(team: number, league: number, season: number): Promise<any> {
        const response = await this.fetch<any[]>('/teams/statistics', { team, league, season });
        return response.response;
    }

    // Search teams by name
    async searchTeams(query: string): Promise<Team[]> {
        const response = await this.fetch<Team[]>('/teams', { search: query });
        return response.response;
    }

    // Get player information
    async getPlayer(playerId: number, season: number): Promise<Player> {
        const response = await this.fetch<Player[]>('/players', { id: playerId, season });
        return response.response[0];
    }

    // Search players by name
    async searchPlayers(query: string, league?: number, season?: number): Promise<Player[]> {
        const params: any = { search: query };
        if (league) params.league = league;
        if (season) params.season = season;

        const response = await this.fetch<Player[]>('/players', params);
        return response.response;
    }

    // Get top scorers for a league
    async getTopScorers(league: number, season: number): Promise<any[]> {
        const response = await this.fetch<any[]>('/players/topscorers', { league, season });
        return response.response;
    }

    // Helper: Get today's date in YYYY-MM-DD format
    getTodayDate(): string {
        return new Date().toLocaleDateString('en-CA');
    }

    // Helper: Get fixtures for today
    async getTodayFixtures(league?: number, sport: string = 'football'): Promise<Match[]> {
        return this.getFixtures({
            date: this.getTodayDate(),
            league,
            timezone: 'Africa/Johannesburg',
        }, sport);
    }

    // Helper: Get popular leagues (European + African)
    getPopularLeagues() {
        return {
            // European
            PREMIER_LEAGUE: 39,
            LA_LIGA: 140,
            BUNDESLIGA: 78,
            SERIE_A: 135,
            LIGUE_1: 61,
            CHAMPIONS_LEAGUE: 2,
            EUROPA_LEAGUE: 3,
            // African
            CAF_CHAMPIONS_LEAGUE: 17,
            AFCON: 6,
            NPFL_NIGERIA: 332,
            PSL_SOUTH_AFRICA: 288,
            EGYPTIAN_PREMIER: 233,
            GHANAIAN_PREMIER: 330,
            KENYAN_PREMIER: 276,
        };
    }

    // Helper: Get only African leagues
    getAfricanLeagues() {
        return {
            CAF_CHAMPIONS_LEAGUE: 17,
            AFCON: 6,
            NPFL_NIGERIA: 332,
            PSL_SOUTH_AFRICA: 288,
            EGYPTIAN_PREMIER: 233,
            GHANAIAN_PREMIER: 330,
            KENYAN_PREMIER: 276,
        };
    }

    // Helper: Get only European leagues
    getEuropeanLeagues() {
        return {
            PREMIER_LEAGUE: 39,
            LA_LIGA: 140,
            BUNDESLIGA: 78,
            SERIE_A: 135,
            LIGUE_1: 61,
            CHAMPIONS_LEAGUE: 2,
            EUROPA_LEAGUE: 3,
        };
    }
}

// Export singleton instance
export const sportsApi = new SportsApiService();
export default sportsApi;
