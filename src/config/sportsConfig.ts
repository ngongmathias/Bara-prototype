
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
        ],
        scoreboardLeagues: [
            { id: 39, name: "Premier League" },
            { id: 140, name: "La Liga" },
            { id: 135, name: "Serie A" },
            { id: 78, name: "Bundesliga" },
            { id: 2, name: "Champions League" },
            { id: 6, name: "AFCON" },
            { id: 288, name: "PSL" },
            { id: 17, name: "CAF Champions League" }
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
        scoreboardLeagues: [
            { id: 12, name: "NBA" },
            { id: 11, name: "NBA G League" },
            { id: 13, name: "WNBA" }
        ],
        groups: [
            {
                title: "Atlantic",
                leagues: [
                    { id: 132, name: "Boston Celtics", logo: "https://media.api-sports.io/basketball/teams/132.png" },
                    { id: 133, name: "Brooklyn Nets", logo: "https://media.api-sports.io/basketball/teams/133.png" },
                    { id: 134, name: "New York Knicks", logo: "https://media.api-sports.io/basketball/teams/134.png" },
                    { id: 135, name: "Philadelphia 76ers", logo: "https://media.api-sports.io/basketball/teams/135.png" },
                    { id: 136, name: "Toronto Raptors", logo: "https://media.api-sports.io/basketball/teams/136.png" }
                ]
            },
            {
                title: "Central",
                leagues: [
                    { id: 137, name: "Chicago Bulls", logo: "https://media.api-sports.io/basketball/teams/137.png" },
                    { id: 138, name: "Cleveland Cavaliers", logo: "https://media.api-sports.io/basketball/teams/138.png" },
                    { id: 139, name: "Detroit Pistons", logo: "https://media.api-sports.io/basketball/teams/139.png" },
                    { id: 140, name: "Indiana Pacers", logo: "https://media.api-sports.io/basketball/teams/140.png" },
                    { id: 141, name: "Milwaukee Bucks", logo: "https://media.api-sports.io/basketball/teams/141.png" }
                ]
            },
            {
                title: "Southeast",
                leagues: [
                    { id: 142, name: "Atlanta Hawks", logo: "https://media.api-sports.io/basketball/teams/142.png" },
                    { id: 143, name: "Charlotte Hornets", logo: "https://media.api-sports.io/basketball/teams/143.png" },
                    { id: 153, name: "Miami Heat", logo: "https://media.api-sports.io/basketball/teams/153.png" },
                    { id: 155, name: "Orlando Magic", logo: "https://media.api-sports.io/basketball/teams/155.png" },
                    { id: 156, name: "Washington Wizards", logo: "https://media.api-sports.io/basketball/teams/156.png" }
                ]
            },
            {
                title: "Northwest",
                leagues: [
                    { id: 144, name: "Denver Nuggets", logo: "https://media.api-sports.io/basketball/teams/144.png" },
                    { id: 146, name: "Minnesota Timberwolves", logo: "https://media.api-sports.io/basketball/teams/146.png" },
                    { id: 147, name: "Oklahoma City Thunder", logo: "https://media.api-sports.io/basketball/teams/147.png" },
                    { id: 148, name: "Portland Trail Blazers", logo: "https://media.api-sports.io/basketball/teams/148.png" },
                    { id: 150, name: "Utah Jazz", logo: "https://media.api-sports.io/basketball/teams/150.png" }
                ]
            },
            {
                title: "Pacific",
                leagues: [
                    { id: 145, name: "Golden State Warriors", logo: "https://media.api-sports.io/basketball/teams/145.png" },
                    { id: 151, name: "LA Clippers", logo: "https://media.api-sports.io/basketball/teams/151.png" },
                    { id: 149, name: "LA Lakers", logo: "https://media.api-sports.io/basketball/teams/149.png" },
                    { id: 152, name: "Phoenix Suns", logo: "https://media.api-sports.io/basketball/teams/152.png" },
                    { id: 157, name: "Sacramento Kings", logo: "https://media.api-sports.io/basketball/teams/157.png" }
                ]
            },
            {
                title: "Southwest",
                leagues: [
                    { id: 158, name: "Dallas Mavericks", logo: "https://media.api-sports.io/basketball/teams/158.png" },
                    { id: 159, name: "Houston Rockets", logo: "https://media.api-sports.io/basketball/teams/159.png" },
                    { id: 160, name: "Memphis Grizzlies", logo: "https://media.api-sports.io/basketball/teams/160.png" },
                    { id: 161, name: "New Orleans Pelicans", logo: "https://media.api-sports.io/basketball/teams/161.png" },
                    { id: 162, name: "San Antonio Spurs", logo: "https://media.api-sports.io/basketball/teams/162.png" }
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
                    { id: 4, name: "Buffalo Bills", logo: "https://media.api-sports.io/american-football/teams/4.png" },
                    { id: 15, name: "Miami Dolphins", logo: "https://media.api-sports.io/american-football/teams/15.png" },
                    { id: 16, name: "New England Patriots", logo: "https://media.api-sports.io/american-football/teams/16.png" },
                    { id: 18, name: "New York Jets", logo: "https://media.api-sports.io/american-football/teams/18.png" }
                ]
            },
            {
                title: "AFC North",
                leagues: [
                    { id: 3, name: "Baltimore Ravens", logo: "https://media.api-sports.io/american-football/teams/3.png" },
                    { id: 7, name: "Cincinnati Bengals", logo: "https://media.api-sports.io/american-football/teams/7.png" },
                    { id: 8, name: "Cleveland Browns", logo: "https://media.api-sports.io/american-football/teams/8.png" },
                    { id: 26, name: "Pittsburgh Steelers", logo: "https://media.api-sports.io/american-football/teams/26.png" }
                ]
            },
            {
                title: "NFC West",
                leagues: [
                    { id: 1, name: "Arizona Cardinals", logo: "https://media.api-sports.io/american-football/teams/1.png" },
                    { id: 28, name: "Los Angeles Rams", logo: "https://media.api-sports.io/american-football/teams/28.png" },
                    { id: 30, name: "San Francisco 49ers", logo: "https://media.api-sports.io/american-football/teams/30.png" },
                    { id: 31, name: "Seattle Seahawks", logo: "https://media.api-sports.io/american-football/teams/31.png" }
                ]
            },
            {
                title: "NFC South",
                leagues: [
                    { id: 2, name: "Atlanta Falcons", logo: "https://media.api-sports.io/american-football/teams/2.png" },
                    { id: 5, name: "Carolina Panthers", logo: "https://media.api-sports.io/american-football/teams/5.png" },
                    { id: 17, name: "New Orleans Saints", logo: "https://media.api-sports.io/american-football/teams/17.png" },
                    { id: 32, name: "Tampa Bay Buccaneers", logo: "https://media.api-sports.io/american-football/teams/32.png" }
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
        featuredLeagues: [
            { id: 3, name: "International Test" },
            { id: 2, name: "International ODI" },
            { id: 1, name: "International T20" },
            { id: 13, name: "IPL", logo: "https://media.api-sports.io/cricket/leagues/13.png" },
            { id: 18, name: "SA20", logo: "https://media.api-sports.io/cricket/leagues/18.png" }
        ],
        featuredTeams: [
            { id: 2, name: "South Africa", logo: "https://media.api-sports.io/cricket/teams/2.png" },
            { id: 1, name: "India", logo: "https://media.api-sports.io/cricket/teams/1.png" },
            { id: 3, name: "Australia", logo: "https://media.api-sports.io/cricket/teams/3.png" },
            { id: 4, name: "England", logo: "https://media.api-sports.io/cricket/teams/4.png" },
            { id: 5, name: "Pakistan", logo: "https://media.api-sports.io/cricket/teams/5.png" }
        ],
        scoreboardLeagues: [
            { id: 3, name: "International Test" },
            { id: 2, name: "International ODI" },
            { id: 1, name: "International T20" },
            { id: 18, name: "SA20" },
            { id: 13, name: "IPL" }
        ]
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
        featuredLeagues: [
            { id: 1, name: "Heavyweight" },
            { id: 2, name: "Light Heavyweight" },
            { id: 3, name: "Middleweight" },
            { id: 4, name: "Welterweight" },
            { id: 5, name: "Lightweight" }
        ],
        featuredTeams: [
            { id: 1, name: "WBC" },
            { id: 2, name: "WBA" },
            { id: 3, name: "IBF" },
            { id: 4, name: "WBO" }
        ],
        scoreboardLeagues: [
            { id: 3, name: "International Test" },
            { id: 2, name: "International ODI" },
            { id: 1, name: "International T20" },
            { id: 18, name: "SA20" },
            { id: 13, name: "IPL" }
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
            { label: 'Fixtures & Results', path: 'fixtures' },
            { label: 'Tables', path: 'tables' },
            { label: 'Tournaments', path: 'tournaments' },
            { label: 'Countries', path: 'countries' },
        ],
        featuredLeagues: [
            { id: 1, name: "Six Nations", logo: "https://media.api-sports.io/rugby/leagues/1.png" },
            { id: 2, name: "Rugby Championship", logo: "https://media.api-sports.io/rugby/leagues/2.png" },
            { id: 3, name: "World Cup", logo: "https://media.api-sports.io/rugby/leagues/3.png" },
            { id: 16, name: "Premiership", logo: "https://media.api-sports.io/rugby/leagues/16.png" },
            { id: 14, name: "Top 14", logo: "https://media.api-sports.io/rugby/leagues/14.png" }
        ],
        featuredTeams: [
            { id: 1, name: "Springboks", logo: "https://media.api-sports.io/rugby/teams/1.png" },
            { id: 2, name: "All Blacks", logo: "https://media.api-sports.io/rugby/teams/2.png" },
            { id: 3, name: "England", logo: "https://media.api-sports.io/rugby/teams/3.png" },
            { id: 4, name: "Ireland", logo: "https://media.api-sports.io/rugby/teams/4.png" },
            { id: 5, name: "France", logo: "https://media.api-sports.io/rugby/teams/5.png" }
        ]
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
