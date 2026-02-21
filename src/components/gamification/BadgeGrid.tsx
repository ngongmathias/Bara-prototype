import React, { useEffect, useState } from 'react';
import { GamificationService, Achievement } from '@/lib/gamificationService';
import { useUser } from '@clerk/clerk-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Medal, Music, ShoppingBag, Calendar, Trophy, Lock } from 'lucide-react';

export const BadgeGrid: React.FC = () => {
    const { user } = useUser();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userBadgeIds, setUserBadgeIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const [allAch, userAch] = await Promise.all([
                GamificationService.getAchievements(),
                GamificationService.getUserAchievements(user.id)
            ]);

            setAchievements(allAch);
            setUserBadgeIds(userAch);
            setLoading(false);
        };

        fetchData();
    }, [user]);

    const getIcon = (category: string, isLocked: boolean) => {
        const className = `w-8 h-8 ${isLocked ? 'text-gray-300' : 'text-orange-500'}`;
        switch (category) {
            case 'music': return <Music className={className} />;
            case 'market': return <ShoppingBag className={className} />;
            case 'general': return <Trophy className={className} />;
            default: return <Medal className={className} />;
        }
    };

    if (loading) return <div className="grid grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-full" />)}
    </div>;

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
            <TooltipProvider>
                {achievements.map((ach) => {
                    const isLocked = !userBadgeIds.includes(ach.id);
                    return (
                        <Tooltip key={ach.id}>
                            <TooltipTrigger asChild>
                                <div className="relative group cursor-help flex flex-col items-center gap-2">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isLocked ? 'bg-gray-50 border-2 border-dashed border-gray-200 grayscale' : 'bg-orange-50 border-2 border-orange-200 shadow-sm hover:scale-110'
                                        }`}>
                                        {getIcon(ach.category, isLocked)}
                                        {isLocked && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Lock className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold text-center uppercase tracking-wider ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {ach.title}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-center">
                                <p className="font-bold mb-1">{ach.title}</p>
                                <p className="text-xs text-gray-500">{ach.description}</p>
                                {isLocked && ach.xp_reward > 0 && (
                                    <p className="text-[10px] text-orange-600 mt-2 font-bold">Reward: +{ach.xp_reward} XP</p>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </TooltipProvider>
        </div>
    );
};
