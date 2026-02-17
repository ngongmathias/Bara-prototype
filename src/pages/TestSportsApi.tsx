import { useState } from 'react';
import { useLiveScores, useTodayFixtures } from '../hooks/useLiveScores';
import sportsApi from '../services/sportsApi';

export default function TestSportsApi() {
    const [testResult, setTestResult] = useState<string>('');
    const [testing, setTesting] = useState(false);

    // Try to get live Premier League scores
    const { data: liveScores, isLoading: liveLoading, error: liveError } = useLiveScores({
        league: 39, // Premier League
        enabled: true
    });

    // Try to get today's fixtures
    const { data: todayFixtures, isLoading: fixturesLoading, error: fixturesError } = useTodayFixtures(39);

    const handleTestBasicApi = async () => {
        setTesting(true);
        setTestResult('Testing...');

        try {
            console.log('🔍 Testing Sports API connection...');

            // Test 1: Get today's date
            const today = sportsApi.getTodayDate();
            console.log('📅 Today:', today);

            // Test 2: Get today's fixtures
            const fixtures = await sportsApi.getTodayFixtures(39);
            console.log('⚽ Today\'s Premier League fixtures:', fixtures);

            // Test 3: Get live scores
            const live = await sportsApi.getLiveScores();
            console.log('🔴 Live matches:', live);

            setTestResult(`✅ API WORKS!\n\n✅ Found ${fixtures?.length || 0} fixtures today\n✅ Found ${live?.length || 0} live matches\n\nCheck console (F12) for full data`);
        } catch (error: any) {
            console.error('❌ API Test Failed:', error);
            setTestResult(`❌ API ERROR:\n\n${error.message}\n\nCheck:\n• API key is correct\n• You have requests left (100/day)\n• Internet connection is working`);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">🏟️ Sports API Test Page</h1>
                    <p className="text-gray-600">Testing API-Football integration for Bara Sports</p>
                </div>

                {/* Test Button */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Manual API Test</h2>
                    <button
                        onClick={handleTestBasicApi}
                        disabled={testing}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition"
                    >
                        {testing ? '⏳ Testing...' : '🧪 Test API Connection'}
                    </button>

                    {testResult && (
                        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm whitespace-pre-wrap font-mono">
                            {testResult}
                        </pre>
                    )}
                </div>

                {/* Live Scores Section */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">🔴 Live Premier League Scores (Auto-updating)</h2>

                    {liveLoading && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <div className="animate-spin">⏳</div>
                            <span>Loading live scores...</span>
                        </div>
                    )}

                    {liveError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                            ❌ Error: {liveError.message}
                        </div>
                    )}

                    {liveScores && (
                        <div className="space-y-3">
                            {liveScores.length === 0 ? (
                                <p className="text-gray-500">No live Premier League matches right now</p>
                            ) : (
                                liveScores.map((match) => (
                                    <div key={match.fixture.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <img
                                                        src={match.teams.home.logo}
                                                        alt={match.teams.home.name}
                                                        className="w-8 h-8"
                                                    />
                                                    <span className="font-semibold">{match.teams.home.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={match.teams.away.logo}
                                                        alt={match.teams.away.name}
                                                        className="w-8 h-8"
                                                    />
                                                    <span className="font-semibold">{match.teams.away.name}</span>
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-3xl font-bold mb-1">
                                                    {match.goals.home} - {match.goals.away}
                                                </div>
                                                <div className="text-sm font-semibold text-red-600 animate-pulse">
                                                    {match.fixture.status.long}
                                                    {match.fixture.status.elapsed && ` (${match.fixture.status.elapsed}')`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Today's Fixtures */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4">📅 Today's Premier League Fixtures</h2>

                    {fixturesLoading && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <div className="animate-spin">⏳</div>
                            <span>Loading fixtures...</span>
                        </div>
                    )}

                    {fixturesError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                            ❌ Error: {fixturesError.message}
                        </div>
                    )}

                    {todayFixtures && (
                        <div className="space-y-3">
                            {todayFixtures.length === 0 ? (
                                <p className="text-gray-500">No Premier League fixtures scheduled for today</p>
                            ) : (
                                todayFixtures.map((match) => (
                                    <div key={match.fixture.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <img
                                                        src={match.teams.home.logo}
                                                        alt={match.teams.home.name}
                                                        className="w-6 h-6"
                                                    />
                                                    <span className="font-semibold">{match.teams.home.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={match.teams.away.logo}
                                                        alt={match.teams.away.name}
                                                        className="w-6 h-6"
                                                    />
                                                    <span className="font-semibold">{match.teams.away.name}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-gray-600">
                                                    {new Date(match.fixture.date).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {match.fixture.venue.name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* API Info */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2">ℹ️ API Information</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Free Tier: 100 requests per day</li>
                        <li>• League ID 39 = Premier League</li>
                        <li>• Live matches auto-refresh every 60 seconds</li>
                        <li>• Check browser console (F12) for detailed API responses</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
