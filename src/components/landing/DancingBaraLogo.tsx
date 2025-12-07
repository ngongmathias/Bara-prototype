import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const africanChars = 'ሀሁሂሃሄህሆለሉሊላልልሎሏመሙሚማሜምሞሟሰሱሲሳሴስሶሷረሩሪራሬርሮሯበቡቢባቤብቦቧተቱቲታቴትቶቷأبتثجحخدذرزسشصضطظعغفقكلمنهوي';

export const DancingBaraLogo = () => {
  const [isRaining, setIsRaining] = useState(false);
  const [raindrops, setRaindrops] = useState<Array<{id: number, char: string, x: number, delay: number, color: string}>>([]);

  const handleHover = () => {
    setIsRaining(true);
    
    const colors = ['#FFD700', '#00FF00', '#32CD32', '#FFB700', '#FF6B6B', '#4ECDC4'];
    
    // Create 40 raindrops
    const drops = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      char: africanChars[Math.floor(Math.random() * africanChars.length)],
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setRaindrops(drops);
  };

  const handleHoverEnd = () => {
    setTimeout(() => {
      setIsRaining(false);
      setRaindrops([]);
    }, 2500);
  };

  return (
    <div 
      className="flex flex-col items-center gap-6 relative"
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverEnd}
    >
      {/* Falling African Characters on Hover */}
      <AnimatePresence>
        {isRaining && raindrops.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute text-3xl font-bold pointer-events-none z-50"
            style={{ color: drop.color }}
            initial={{ x: `${drop.x}%`, y: -100, opacity: 1, rotate: 0 }}
            animate={{ 
              y: 600, 
              opacity: [1, 1, 0.5, 0],
              rotate: Math.random() * 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2.5 + Math.random(), 
              delay: drop.delay,
              ease: "linear" 
            }}
          >
            {drop.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* All logos together in one card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl px-12 py-8 shadow-2xl">
        {/* Top Row: Africa × B - Subtle Professional Motion */}
        <div className="flex items-center gap-8 mb-6">
        {/* Africa Map - Subtle Float */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img 
            src="/images/africa-map.png" 
            alt="Africa Map Logo"
            className="w-28 h-auto drop-shadow-xl"
          />
        </motion.div>

        {/* × Symbol - Static, Professional */}
        <div className="text-black text-5xl font-light">
          ×
        </div>

        {/* B Lettermark - Subtle Float (opposite rhythm) */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3, // Opposite phase
          }}
        >
          <img 
            src="/images/b-lettermark.png" 
            alt="B Lettermark Logo"
            className="w-28 h-auto drop-shadow-xl"
          />
        </motion.div>
      </div>

        {/* BARA Text - Very Subtle Float */}
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-4"
        >
          <img 
            src="/images/bara-text.png" 
            alt="BARA Logo"
            className="w-80 h-auto drop-shadow-lg mx-auto"
          />
          <p className="text-center text-xs text-gray-500 tracking-[0.3em] uppercase mt-2">
            We Are Together
          </p>
        </motion.div>
      </div>
    </div>
  );
};
