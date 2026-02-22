import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Trophy, Zap, Coins, X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GamificationService, UserMission } from '@/lib/gamificationService';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const DailyMissions = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [missions, setMissions] = useState<UserMission[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMissions();
        }
    }, [user, isOpen]);

    const fetchMissions = async () => {
        if (!user) return;
        const data = await GamificationService.getMissions(user.id);
        setMissions(data);
    };

    const handleClaim = async (mission: UserMission) => {
        if (!user) return;
        setLoading(true);
        try {
            const success = await GamificationService.claimMissionReward(user.id, mission.id);
            if (success) {
                // Trigger local visual feedback
                toast({
                    title: "Reward Claimed!",
                    description: `You earned ${mission.coin_reward} Coins and ${mission.xp_reward} XP.`,
                });
                fetchMissions();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to claim reward. Please try again.",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const completedCount = missions.filter(m => m.is_completed).length;
    const claimableCount = missions.filter(m => m.is_completed && !m.claimed_at).length;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4"
                    >
                        <Card className="w-80 border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
                            <div className="p-6 bg-black text-white relative">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                                <h3 className="text-xl font-black font-comfortaa">Daily Missions</h3>
                                <div className="flex items-center gap-2 mt-2 text-xs font-bold text-yp-yellow">
                                    <Trophy size={14} />
                                    {completedCount}/{missions.length} Completed
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
                                {missions.length === 0 && (
                                    <div className="text-center text-gray-400 py-4 italic text-sm">No missions available today.</div>
                                )}
                                {missions.map((mission) => (
                                    <div key={mission.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {mission.is_completed ? (
                                                    <CheckCircle2 className="text-green-500" size={16} />
                                                ) : (
                                                    <Circle className="text-gray-200" size={16} />
                                                )}
                                                <span className={`text-sm font-bold ${mission.is_completed ? 'text-gray-400' : 'text-gray-700'}`}>
                                                    {mission.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {mission.xp_reward > 0 && (
                                                    <div className="flex items-center gap-1 text-[8px] font-black text-blue-600 bg-blue-50 px-1 py-0.5 rounded uppercase">
                                                        +{mission.xp_reward} XP
                                                    </div>
                                                )}
                                                {mission.coin_reward > 0 && (
                                                    <div className="flex items-center gap-1 text-[8px] font-black text-yellow-600 bg-yellow-50 px-1 py-0.5 rounded uppercase">
                                                        +{mission.coin_reward} Coins
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Progress value={(mission.current_progress / mission.goal) * 100} className="h-1.5" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-gray-500 italic max-w-[70%] truncate">{mission.description}</span>
                                                <div className="text-[10px] text-gray-400 font-bold">
                                                    {mission.current_progress}/{mission.goal}
                                                </div>
                                            </div>
                                        </div>
                                        {mission.is_completed && !mission.claimed_at && (
                                            <Button
                                                size="sm"
                                                className="w-full bg-yp-yellow hover:bg-yellow-500 text-black font-black text-[10px] h-7 rounded-lg mt-2"
                                                onClick={() => handleClaim(mission)}
                                                disabled={loading}
                                            >
                                                <Gift size={12} className="mr-1" />
                                                CLAIM REWARD
                                            </Button>
                                        )}
                                        {mission.claimed_at && (
                                            <div className="text-center text-[10px] text-green-600 font-bold py-1 bg-green-50 rounded-lg">
                                                REWARD CLAIMED
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-yp-yellow text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform relative group"
            >
                {claimableCount > 0 && !isOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                        {claimableCount}
                    </div>
                )}
                <Zap size={24} fill="currentColor" />
                <div className="absolute right-full mr-4 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    View Daily Missions
                </div>
            </button>
        </div>
    );
};
