
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
    scoreboardLeagues?: TeamLink[]; // Leagues for the ticker dropdown
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
            { label: 'Teams', path: 'teams' },
            { label: 'News', path: 'news' },
            { label: 'Predictions', path: '../predictions' },
        ],
        featuredLeagues: [
            { id: 6, name: "AFCON", logo: "https://media.api-sports.io/football/leagues/6.png" },
            { id: 17, name: "CAF Champions League", logo: "https://media.api-sports.io/football/leagues/17.png" },
            { id: 288, name: "South Africa PSL", logo: "https://media.api-sports.io/football/leagues/288.png" },
            { id: 332, name: "Nigeria NPFL", logo: "https://media.api-sports.io/football/leagues/332.png" },
            { id: 233, name: "Egypt Premier League", logo: "https://media.api-sports.io/football/leagues/233.png" },
            { id: 39, name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
            { id: 140, name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
            { id: 2, name: "Champions League", logo: "https://media.api-sports.io/football/leagues/2.png" },
        ],
        featuredTeams: [
            { id: 1030, name: "Al Ahly (Egypt)", logo: "https://media.api-sports.io/football/teams/1030.png" },
            { id: 1031, name: "Zamalek (Egypt)", logo: "https://media.api-sports.io/football/teams/1031.png" },
            { id: 2283, name: "Kaizer Chiefs", logo: "https://media.api-sports.io/football/teams/2283.png" },
            { id: 2284, name: "Orlando Pirates", logo: "https://media.api-sports.io/football/teams/2284.png" },
            { id: 2279, name: "Mamelodi Sundowns", logo: "https://media.api-sports.io/football/teams/2279.png" },
            { id: 1032, name: "TP Mazembe", logo: "https://media.api-sports.io/football/teams/1032.png" },
            { id: 2293, name: "Enyimba FC", logo: "https://media.api-sports.io/football/teams/2293.png" },
            { id: 1035, name: "Esperance Tunis", logo: "https://media.api-sports.io/football/teams/1035.png" },
        ],
        scoreboardLeagues: [
            { id: 6, name: "AFCON" },
            { id: 17, name: "CAF Champions League" },
            { id: 288, name: "South Africa PSL" },
            { id: 332, name: "Nigeria NPFL" },
            { id: 233, name: "Egypt Premier League" },
            { id: 39, name: "Premier League" },
            { id: 140, name: "La Liga" },
            { id: 135, name: "Serie A" },
            { id: 2, name: "Champions League" },
        ]
    },
    athletics: {
        id: 'athletics',
        name: 'Athletics',
        slug: 'athletics',
        apiId: 'athletics',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'News', path: 'news' },
            { label: 'Schedule', path: 'schedule' },
            { label: 'Rankings', path: 'rankings' },
        ],
        featuredLeagues: [
            { id: 1, name: "World Athletics" },
            { id: 2, name: "Diamond League" },
            { id: 3, name: "African Athletics Championships" },
            { id: 4, name: "Commonwealth Games" },
        ],
        featuredTeams: [
            { id: 1, name: "Kenya" },
            { id: 2, name: "Ethiopia" },
            { id: 3, name: "South Africa" },
            { id: 4, name: "Nigeria" },
            { id: 5, name: "Morocco" },
        ]
    },
    rugby: {
        id: 'rugby',
        name: 'Rugby',
        slug: 'rugby',
        apiId: 'rugby',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'Scores', path: 'scores' },
            { label: 'Fixtures', path: 'fixtures' },
            { label: 'Standings', path: 'standings' },
            { label: 'Teams', path: 'teams' },
            { label: 'News', path: 'news' },
        ],
        featuredLeagues: [
            { id: 2, name: "Rugby Championship", logo: "https://media.api-sports.io/rugby/leagues/2.png" },
            { id: 3, name: "World Cup", logo: "https://media.api-sports.io/rugby/leagues/3.png" },
            { id: 1, name: "Six Nations", logo: "https://media.api-sports.io/rugby/leagues/1.png" },
            { id: 16, name: "URC", logo: "https://media.api-sports.io/rugby/leagues/16.png" },
            { id: 20, name: "Africa Gold Cup" },
        ],
        featuredTeams: [
            { id: 1, name: "Springboks (South Africa)", logo: "https://media.api-sports.io/rugby/teams/1.png" },
            { id: 10, name: "Kenya Simbas" },
            { id: 11, name: "Namibia" },
            { id: 2, name: "All Blacks", logo: "https://media.api-sports.io/rugby/teams/2.png" },
            { id: 3, name: "England", logo: "https://media.api-sports.io/rugby/teams/3.png" },
        ]
    },
    cricket: {
        id: 'cricket',
        name: 'Cricket',
        slug: 'cricket',
        apiId: 'cricket',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'Scores', path: 'scores' },
            { label: 'Schedule', path: 'schedule' },
            { label: 'Standings', path: 'standings' },
            { label: 'Teams', path: 'teams' },
            { label: 'News', path: 'news' },
        ],
        featuredLeagues: [
            { id: 18, name: "SA20", logo: "https://media.api-sports.io/cricket/leagues/18.png" },
            { id: 3, name: "International Test" },
            { id: 2, name: "International ODI" },
            { id: 1, name: "International T20" },
            { id: 13, name: "IPL", logo: "https://media.api-sports.io/cricket/leagues/13.png" },
        ],
        featuredTeams: [
            { id: 2, name: "South Africa", logo: "https://media.api-sports.io/cricket/teams/2.png" },
            { id: 15, name: "Zimbabwe" },
            { id: 16, name: "Kenya" },
            { id: 1, name: "India", logo: "https://media.api-sports.io/cricket/teams/1.png" },
            { id: 3, name: "Australia", logo: "https://media.api-sports.io/cricket/teams/3.png" },
        ],
        scoreboardLeagues: [
            { id: 18, name: "SA20" },
            { id: 3, name: "International Test" },
            { id: 2, name: "International ODI" },
            { id: 1, name: "International T20" },
            { id: 13, name: "IPL" },
        ]
    },
    boxing: {
        id: 'boxing',
        name: 'Boxing/MMA',
        slug: 'boxing',
        apiId: 'boxing',
        navItems: [
            { label: 'Home', path: '' },
            { label: 'News', path: 'news' },
            { label: 'Rankings', path: 'rankings' },
            { label: 'Schedule', path: 'schedule' },
        ],
        featuredLeagues: [
            { id: 1, name: "Heavyweight" },
            { id: 2, name: "Light Heavyweight" },
            { id: 3, name: "Middleweight" },
            { id: 4, name: "Welterweight" },
            { id: 5, name: "Lightweight" },
        ],
        featuredTeams: [
            { id: 1, name: "Francis Ngannou (Cameroon)" },
            { id: 2, name: "Israel Adesanya (Nigeria)" },
            { id: 3, name: "Kamaru Usman (Nigeria)" },
            { id: 4, name: "Dricus du Plessis (South Africa)" },
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
            { label: 'Teams', path: 'teams' },
            { label: 'News', path: 'news' },
        ],
        featuredLeagues: [
            { id: 12, name: "NBA", logo: "https://media.api-sports.io/basketball/leagues/12.png" },
            { id: 97, name: "BAL (Basketball Africa League)" },
        ],
        featuredTeams: [
            { id: 149, name: "LA Lakers", logo: "https://media.api-sports.io/basketball/teams/149.png" },
            { id: 132, name: "Boston Celtics", logo: "https://media.api-sports.io/basketball/teams/132.png" },
            { id: 145, name: "Golden State Warriors", logo: "https://media.api-sports.io/basketball/teams/145.png" },
            { id: 153, name: "Miami Heat", logo: "https://media.api-sports.io/basketball/teams/153.png" },
        ],
        scoreboardLeagues: [
            { id: 12, name: "NBA" },
            { id: 97, name: "Basketball Africa League" },
        ],
        groups: [
            {
                title: "African NBA Stars",
                leagues: [
                    { id: 1, name: "Joel Embiid (Cameroon)" },
                    { id: 2, name: "Pascal Siakam (Cameroon)" },
                    { id: 3, name: "Giannis Antetokounmpo (Nigeria/Greece)" },
                    { id: 4, name: "Rui Hachimura (Japan/Benin)" },
                    { id: 5, name: "Serge Ibaka (Congo)" },
                ]
            },
            {
                title: "BAL Teams",
                leagues: [
                    { id: 10, name: "Petro de Luanda (Angola)" },
                    { id: 11, name: "AS Salé (Morocco)" },
                    { id: 12, name: "Rivers Hoopers (Nigeria)" },
                    { id: 13, name: "Cape Town Tigers (South Africa)" },
                    { id: 14, name: "REG (Rwanda)" },
                ]
            }
        ]
    }
};

export const MORE_SPORTS = [
    { label: 'F1', slug: 'f1' },
    { label: 'Tennis', slug: 'tennis' },
    { label: 'Netball', slug: 'netball' },
    { label: 'Olympics', slug: 'olympics' },
    { label: 'Cycling', slug: 'cycling' },
    { label: 'Golf', slug: 'golf' },
    { label: 'Swimming', slug: 'swimming' },
    { label: 'Wrestling', slug: 'wrestling' },
];
