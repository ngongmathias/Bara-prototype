import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Lock, CheckCircle2, Star, Award } from 'lucide-react';
import { GamificationService, Achievement } from '@/lib/gamificationService';
import { Skeleton } from '@/components/ui/skeleton';

interface AchievementHallProps {
    userId: string;
}

export const AchievementHall: React.FC<AchievementHallProps> = ({ userId }) => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [earnedIds, setEarnedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            setLoading(true);
            try {
                const [all, earned] = await Promise.all([
                    GamificationService.getAchievements(),
                    GamificationService.getUserAchievements(userId)
                ]);
                setAchievements(all);
                setEarnedIds(earned);
            } catch (error) {
                console.error('Error fetching achievements:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchAchievements();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold font-comfortaa">Achievement Hall</h3>
                    <p className="text-sm text-muted-foreground">You have unlocked {earnedIds.length} of {achievements.length} badges.</p>
                </div>
                <Trophy className="text-yellow-500 w-8 h-8" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => {
                    const isEarned = earnedIds.includes(achievement.id);
                    return (
                        <Card key={achievement.id} className={`${isEarned ? 'bg-white border-yellow-200 shadow-md' : 'bg-gray-50 opacity-60 grayscale border-dashed'} transition-all duration-300`}>
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className={`p-3 rounded-full ${isEarned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-500'}`}>
                                    {isEarned ? <Award size={24} /> : <Lock size={20} />}
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-bold">{achievement.title}</CardTitle>
                                    {isEarned && (
                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600">
                                            <CheckCircle2 size={10} /> Earned
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground leading-snug mb-2">{achievement.description}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">+{achievement.xp_reward} XP</span>
                                    <span className="text-[10px] font-bold bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">+{achievement.coin_reward} Coins</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
