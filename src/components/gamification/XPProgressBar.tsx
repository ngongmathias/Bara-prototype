import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Coins, Trophy, Flame } from 'lucide-react';
import { getPrestigeTier } from '@/lib/gamificationService';

interface XPProgressBarProps {
    showCoins?: boolean;
    showStreak?: boolean;
    className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
    showCoins = true,
    showStreak = true,
    className = ""
}) => {
    const { profile, loading, getProgress } = useGamification();

    if (loading || !profile) return null;

    const { current, next, percentage } = getProgress();
    const tier = getPrestigeTier(profile.current_level);

    // Elite Visuals mapping
    const tierStyles: Record<string, string> = {
        'Explorer': 'bg-gray-400',
        'Bronze': 'bg-gradient-to-r from-amber-700 to-amber-500',
        'Silver': 'bg-gradient-to-r from-slate-400 to-slate-200',
        'Gold': 'bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 animate-shimmer bg-[length:200%_100%]',
        'Diamond': 'bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 animate-shimmer bg-[length:200%_100%]'
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5 text-orange-600">
                    <Trophy className="w-3 h-3" />
                    <span>{tier} Lvl {profile.current_level}</span>
                </div>

                <div className="flex items-center gap-3">
                    {showStreak && profile.consecutive_days > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-0.5 text-red-500 animate-pulse">
                                        <Flame className="w-3 h-3 fill-red-500" />
                                        <span>{profile.consecutive_days}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">
                                        {profile.consecutive_days} Day Streak! ({profile.multiplier}x XP)
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {showCoins && (
                        <div className="flex items-center gap-1 text-yellow-600">
                            <Coins className="w-3 h-3" />
                            <span>{profile.bara_coins.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                            <div
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${tierStyles[tier]}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">
                            {current.toLocaleString()} / {next.toLocaleString()} XP to Next Level
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
