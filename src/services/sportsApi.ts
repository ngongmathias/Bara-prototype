import type { ApiResponse, Match, Standing, MatchEvent, MatchStatistic, Lineup, Team, Player } from '../types/sports';

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || 'demo-key';

const SPORT_BASE_URLS: Record<string, string> = {
    football: 'https://v3.football.api-sports.io',
    basketball: 'https://v1.basketball.api-sports.io',
    baseball: 'https://v1.baseball.api-sports.io',
    'american-football': 'https://v1.american-football.api-sports.io',
    rugby: 'https://v1.rugby.api-sports.io',
    cricket: 'https://v1.cricket.api-sports.io',
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

    private async fetch<T>(endpoint: string, params: Record<string, any> = {}, sport: string = 'football'): Promise<ApiResponse<T>> {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null)
        ).toString();

        const baseUrl = this.getBaseUrl(sport);
        const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers,
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) {
                throw new Error(`API returned errors: ${JSON.stringify(data.errors)}`);
            }

            return data;
        } catch (error) {
            console.error('Sports API fetch error:', error);
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
        const response = await this.fetch<Match[]>('/fixtures', params, sport);
        return response.response;
    }

    // Get live scores across all leagues
    async getLiveScores(league?: number, sport: string = 'football'): Promise<Match[]> {
        const params: any = { live: 'all' };
        if (league) params.league = league;

        const response = await this.fetch<Match[]>('/fixtures', params, sport);
        return response.response;
    }

    // Get detailed information about a specific match
    async getMatchDetails(fixtureId: number): Promise<Match> {
        const response = await this.fetch<Match[]>('/fixtures', { id: fixtureId });
        return response.response[0];
    }

    // Get match events (goals, cards, substitutions)
    async getMatchEvents(fixtureId: number): Promise<MatchEvent[]> {
        const response = await this.fetch<MatchEvent[]>('/fixtures/events', { fixture: fixtureId });
        return response.response;
    }

    // Get match statistics
    async getMatchStatistics(fixtureId: number): Promise<MatchStatistic[]> {
        const response = await this.fetch<MatchStatistic[]>('/fixtures/statistics', { fixture: fixtureId });
        return response.response;
    }

    // Get match lineups
    async getMatchLineups(fixtureId: number): Promise<Lineup[]> {
        const response = await this.fetch<Lineup[]>('/fixtures/lineups', { fixture: fixtureId });
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
        return new Date().toISOString().split('T')[0];
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
