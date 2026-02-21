import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Coins, Trophy } from 'lucide-react';

interface XPProgressBarProps {
    showCoins?: boolean;
    className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({ showCoins = true, className = "" }) => {
    const { profile, loading, getProgress } = useGamification();

    if (loading || !profile) return null;

    const { current, next, percentage } = getProgress();

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-orange-600">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Level {profile.current_level}</span>
                </div>
                {showCoins && (
                    <div className="flex items-center gap-1 text-yellow-600">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{profile.bara_coins.toLocaleString()}</span>
                    </div>
                )}
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-full">
                            <Progress value={percentage} className="h-2 bg-gray-100" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">
                            {current.toLocaleString()} / {next.toLocaleString()} XP to Level {profile.current_level + 1}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
