// TypeScript types for Sports API data

export interface Team {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    logo: string;
}

export interface League {
    id: number;
    name: string;
    type: string;
    logo: string;
    country: string;
    season: number;
}

export interface Venue {
    id: number;
    name: string;
    city: string;
    capacity: number;
}

export interface Score {
    home: number | null;
    away: number | null;
}

export interface MatchStatus {
    long: string; // "Match Finished", "In Play", etc.
    short: string; // "FT", "LIVE", "NS"
    elapsed: number | null;
}

export interface Fixture {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    venue: Venue;
    status: MatchStatus;
}

export interface Teams {
    home: Team;
    away: Team;
}

export interface Goals {
    home: number | null;
    away: number | null;
}

export interface Match {
    fixture: Fixture;
    league: League;
    teams: Teams;
    goals: Goals;
    score: {
        halftime: Score;
        fulltime: Score;
        extratime: Score;
        penalty: Score;
    };
}

export interface Player {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: {
        date: string;
        place: string;
        country: string;
    };
    nationality: string;
    height: string;
    weight: string;
    photo: string;
}

export interface PlayerStatistics {
    player: Player;
    statistics: Array<{
        team: Team;
        league: League;
        games: {
            appearences: number;
            lineups: number;
            minutes: number;
            position: string;
        };
        goals: {
            total: number;
            assists: number;
        };
        cards: {
            yellow: number;
            red: number;
        };
    }>;
}

export interface Standing {
    rank: number;
    team: Team;
    points: number;
    goalsDiff: number;
    group: string;
    form: string;
    status: string;
    description: string;
    all: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: { for: number; against: number };
    };
    home: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: { for: number; against: number };
    };
    away: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: { for: number; against: number };
    };
}

export interface MatchEvent {
    time: {
        elapsed: number;
        extra: number | null;
    };
    team: Team;
    player: Player;
    assist: Player | null;
    type: string; // "Goal", "Card", "subst"
    detail: string; // "Normal Goal", "Yellow Card", etc.
    comments: string | null;
}

export interface MatchStatistic {
    team: Team;
    statistics: Array<{
        type: string;
        value: number | string;
    }>;
}

export interface Lineup {
    team: Team;
    formation: string;
    startXI: Array<{
        player: Player;
        number: number;
        pos: string;
        grid: string;
    }>;
    substitutes: Array<{
        player: Player;
        number: number;
        pos: string;
    }>;
}

// API Response types
export interface ApiResponse<T> {
    get: string;
    parameters: Record<string, any>;
    errors: any[];
    results: number;
    paging: {
        current: number;
        total: number;
    };
    response: T;
}
