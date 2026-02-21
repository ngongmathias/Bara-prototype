
export interface SportNav {
    label: string;
    path: string;
    icon?: string;
}

export interface TeamLink {
    name: string;
    id: number;
    logo?: string;
}

export interface LeagueGroup {
    title: string;
    leagues: TeamLink[];
}

export interface SportConfig {
    id: string;
    name: string;
    slug: string;
    apiId: string; // Used for API calls (e.g., 'football', 'nba', etc.)
    navItems: SportNav[];
    featuredLeagues: TeamLink[];
    featuredTeams: TeamLink[];
    groups?: LeagueGroup[]; // For conferences/divisions
}

export const SPORTS_CONFIG: Record<string, SportConfig> = {
    football: {
        id: 'football',
        name: 'Football',
        slug: 'football',
        apiId: 'football',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'Scores', path: 'scores' },
            { label: 'Fixtures', path: 'fixtures' },
            { label: 'Standings', path: 'standings' },
            { label: 'Transfers', path: 'transfers' },
            { label: 'Leagues & Cups', path: 'leagues' },
            { label: 'Teams', path: 'teams' },
        ],
        featuredLeagues: [
            { id: 39, name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
            { id: 140, name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
            { id: 135, name: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png" },
            { id: 78, name: "Bundesliga", logo: "https://media.api-sports.io/football/leagues/78.png" },
            { id: 2, name: "Champions League", logo: "https://media.api-sports.io/football/leagues/2.png" }
        ],
        featuredTeams: [
            { id: 33, name: "Man United", logo: "https://media.api-sports.io/football/teams/33.png" },
            { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
            { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
            { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
            { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" }
        ]
    },
    nba: {
        id: 'nba',
        name: 'NBA',
        slug: 'nba',
        apiId: 'basketball',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'Scores', path: 'scores' },
            { label: 'Schedule', path: 'schedule' },
            { label: 'Standings', path: 'standings' },
            { label: 'Stats', path: 'stats' },
            { label: 'Teams', path: 'teams' },
            { label: 'NBA BPI', path: 'bpi' },
            { label: 'Power Rankings', path: 'power-rankings' },
            { label: 'Draft', path: 'draft' },
        ],
        featuredLeagues: [
            { id: 12, name: "NBA", logo: "https://media.api-sports.io/basketball/leagues/12.png" }
        ],
        featuredTeams: [
            { id: 132, name: "Boston Celtics", logo: "https://media.api-sports.io/basketball/teams/132.png" },
            { id: 145, name: "Golden State Warriors", logo: "https://media.api-sports.io/basketball/teams/145.png" },
            { id: 149, name: "LA Lakers", logo: "https://media.api-sports.io/basketball/teams/149.png" },
            { id: 153, name: "Miami Heat", logo: "https://media.api-sports.io/basketball/teams/153.png" },
            { id: 154, name: "Milwaukee Bucks", logo: "https://media.api-sports.io/basketball/teams/154.png" }
        ],
        groups: [
            {
                title: "Atlantic",
                leagues: [
                    { id: 132, name: "Boston Celtics" },
                    { id: 133, name: "Brooklyn Nets" },
                    { id: 134, name: "New York Knicks" },
                    { id: 135, name: "Philadelphia 76ers" },
                    { id: 136, name: "Toronto Raptors" }
                ]
            },
            {
                title: "Central",
                leagues: [
                    { id: 137, name: "Chicago Bulls" },
                    { id: 138, name: "Cleveland Cavaliers" },
                    { id: 139, name: "Detroit Pistons" },
                    { id: 140, name: "Indiana Pacers" },
                    { id: 141, name: "Milwaukee Bucks" }
                ]
            }
        ]
    },
    nfl: {
        id: 'nfl',
        name: 'NFL',
        slug: 'nfl',
        apiId: 'american-football',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'Scores', path: 'scores' },
            { label: 'Schedule', path: 'schedule' },
            { label: 'Standings', path: 'standings' },
            { label: 'Stats', path: 'stats' },
            { label: 'Teams', path: 'teams' },
            { label: 'NFL FPI', path: 'fpi' },
            { label: 'NFL Draft', path: 'draft' },
        ],
        featuredLeagues: [
            { id: 1, name: "NFL", logo: "https://media.api-sports.io/american-football/leagues/1.png" }
        ],
        featuredTeams: [
            { id: 1, name: "Arizona Cardinals" },
            { id: 2, name: "Atlanta Falcons" },
            { id: 3, name: "Baltimore Ravens" },
            { id: 4, name: "Buffalo Bills" },
            { id: 5, name: "Carolina Panthers" }
        ],
        groups: [
            {
                title: "AFC East",
                leagues: [
                    { id: 4, name: "Buffalo Bills" },
                    { id: 15, name: "Miami Dolphins" },
                    { id: 16, name: "New England Patriots" },
                    { id: 18, name: "New York Jets" }
                ]
            },
            {
                title: "NFC West",
                leagues: [
                    { id: 1, name: "Arizona Cardinals" },
                    { id: 28, name: "Los Angeles Rams" },
                    { id: 30, name: "San Francisco 49ers" },
                    { id: 31, name: "Seattle Seahawks" }
                ]
            }
        ]
    },
    cricket: {
        id: 'cricket',
        name: 'Cricket',
        slug: 'cricket',
        apiId: 'cricket',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'Scores & Fixtures', path: 'scores' },
            { label: 'Series', path: 'series' },
            { label: 'ICC Rankings', path: 'rankings' },
            { label: 'Teams', path: 'teams' },
            { label: 'ESPNCricInfo', path: 'cricinfo' },
        ],
        featuredLeagues: [],
        featuredTeams: []
    },
    boxing: {
        id: 'boxing',
        name: 'Boxing',
        slug: 'boxing',
        apiId: 'boxing',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'Rankings', path: 'rankings' },
            { label: 'P4P rankings', path: 'p4p' },
            { label: 'Upcoming', path: 'upcoming' },
        ],
        featuredLeagues: [],
        featuredTeams: []
    },
    rugby: {
        id: 'rugby',
        name: 'Rugby',
        slug: 'rugby',
        apiId: 'rugby',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'Scores', path: 'scores' },
            { label: 'Fixtures & Results', path: 'fixtures' },
            { label: 'Tables', path: 'tables' },
            { label: 'Tournaments', path: 'tournaments' },
            { label: 'Countries', path: 'countries' },
        ],
        featuredLeagues: [],
        featuredTeams: []
    }
};

export const MORE_SPORTS = [
    { label: 'F1', slug: 'f1' },
    { label: 'MMA', slug: 'mma' },
    { label: 'Olympics', slug: 'olympics' },
    { label: 'NBA G League', slug: 'nba-g-league' },
    { label: 'Tennis', slug: 'tennis' },
    { label: 'NHL', slug: 'nhl' },
    { label: 'NRL', slug: 'nrl' },
    { label: 'Cycling', slug: 'cycling' },
    { label: 'Golf', slug: 'golf' },
    { label: 'WWE', slug: 'wwe' },
    { label: 'NASCAR', slug: 'nascar' },
    { label: 'IndyCar', slug: 'indycar' },
    { label: 'NCAAF', slug: 'ncaaf' },
    { label: 'NCAAM', slug: 'ncaam' },
    { label: 'NCAAW', slug: 'ncaaw' },
    { label: 'Netball', slug: 'netball' },
];
