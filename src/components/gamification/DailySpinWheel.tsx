import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Coins, Zap, Star, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GamificationService } from '@/lib/gamificationService';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface WheelSegment {
  label: string;
  value: number;
  type: 'coins' | 'xp';
  color: string;
  probability: number;
}

const SEGMENTS: WheelSegment[] = [
  { label: '5 Coins', value: 5, type: 'coins', color: '#FBBF24', probability: 30 },
  { label: '10 XP', value: 10, type: 'xp', color: '#60A5FA', probability: 25 },
  { label: '10 Coins', value: 10, type: 'coins', color: '#F59E0B', probability: 20 },
  { label: '25 XP', value: 25, type: 'xp', color: '#3B82F6', probability: 12 },
  { label: '25 Coins', value: 25, type: 'coins', color: '#D97706', probability: 8 },
  { label: '50 XP', value: 50, type: 'xp', color: '#2563EB', probability: 3 },
  { label: '50 Coins', value: 50, type: 'coins', color: '#B45309', probability: 1.5 },
  { label: '100 XP', value: 100, type: 'xp', color: '#1D4ED8', probability: 0.5 },
];

function pickSegment(): number {
  const total = SEGMENTS.reduce((sum, s) => sum + s.probability, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < SEGMENTS.length; i++) {
    rand -= SEGMENTS[i].probability;
    if (rand <= 0) return i;
  }
  return 0;
}

export function DailySpinWheel() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      checkSpinEligibility();
    }
  }, [user, isOpen]);

  useEffect(() => {
    drawWheel();
  }, [rotation]);

  const checkSpinEligibility = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('gamification_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('reason', 'Daily Spin Wheel')
        .gte('created_at', `${today}T00:00:00`)
        .limit(1);

      setCanSpin(!data || data.length === 0);
    } catch {
      setCanSpin(true);
    } finally {
      setLoading(false);
    }
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;
    const segCount = SEGMENTS.length;
    const arc = (2 * Math.PI) / segCount;

    ctx.clearRect(0, 0, size, size);

    // Draw segments
    for (let i = 0; i < segCount; i++) {
      const angle = i * arc + (rotation * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.closePath();
      ctx.fillStyle = SEGMENTS[i].color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;
      ctx.fillText(SEGMENTS[i].label, radius - 12, 4);
      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#111';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const handleSpin = async () => {
    if (!user || spinning || !canSpin) return;

    setSpinning(true);
    setResult(null);

    const winIndex = pickSegment();
    const segAngle = 360 / SEGMENTS.length;
    const targetAngle = 360 - (winIndex * segAngle + segAngle / 2);
    const totalRotation = 360 * 5 + targetAngle; // 5 full spins + landing

    // Animate rotation
    const startRotation = rotation;
    const duration = 4000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * eased;
      setRotation(currentRotation % 360);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setRotation(currentRotation % 360);
        onSpinComplete(SEGMENTS[winIndex]);
      }
    };

    requestAnimationFrame(animate);
  };

  const onSpinComplete = async (segment: WheelSegment) => {
    setResult(segment);
    setCanSpin(false);
    setSpinning(false);

    if (!user) return;

    try {
      if (segment.type === 'coins') {
        const profile = await GamificationService.getProfile(user.id);
        if (profile) {
          await supabase
            .from('gamification_profiles')
            .update({ bara_coins: Number(profile.bara_coins) + segment.value })
            .eq('user_id', user.id);

          await supabase.from('gamification_history').insert({
            user_id: user.id,
            type: 'coin_gain',
            amount: segment.value,
            reason: 'Daily Spin Wheel',
          });
        }
      } else {
        await GamificationService.addXP(user.id, segment.value, 'Daily Spin Wheel');
      }

      toast({
        title: `You won ${segment.label}!`,
        description: segment.type === 'coins' ? 'Coins added to your balance.' : 'XP added to your profile.',
      });
    } catch (error) {
      console.error('Error awarding spin reward:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4"
          >
            <Card className="w-80 border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
              <div className="p-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white relative">
                <button
                  onClick={() => { setIsOpen(false); setResult(null); }}
                  className="absolute top-3 right-3 text-white/70 hover:text-white"
                >
                  <X size={16} />
                </button>
                <h3 className="text-lg font-black font-comfortaa flex items-center gap-2">
                  <Sparkles size={18} />
                  Daily Spin
                </h3>
                <p className="text-xs text-white/80 mt-1">Spin once a day for free rewards!</p>
              </div>

              <CardContent className="p-5 flex flex-col items-center">
                {loading ? (
                  <div className="py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
                  </div>
                ) : (
                  <>
                    {/* Wheel */}
                    <div className="relative my-4">
                      {/* Pointer */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[16px] border-l-transparent border-r-transparent border-t-red-600" />
                      </div>
                      <canvas
                        ref={canvasRef}
                        width={220}
                        height={220}
                        className="rounded-full shadow-lg"
                      />
                    </div>

                    {/* Result */}
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-3"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {result.type === 'coins' ? (
                            <Coins className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <Zap className="w-5 h-5 text-blue-600" />
                          )}
                          <span className="text-lg font-black text-gray-900">{result.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">Come back tomorrow for another spin!</p>
                      </motion.div>
                    )}

                    {/* Spin Button */}
                    <Button
                      onClick={handleSpin}
                      disabled={!canSpin || spinning}
                      className={`w-full py-5 font-black text-sm rounded-xl ${
                        canSpin && !spinning
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {spinning ? 'Spinning...' : canSpin ? 'SPIN THE WHEEL' : 'Come Back Tomorrow'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform relative group"
      >
        {canSpin && !isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
            1
          </div>
        )}
        <Gift size={24} />
        <div className="absolute left-full ml-4 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Daily Spin Wheel
        </div>
      </button>
    </div>
  );
}
