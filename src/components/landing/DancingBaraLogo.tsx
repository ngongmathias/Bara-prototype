import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const africanChars = 'ሀሁሂሃሄህሆለሉሊላልልሎሏመሙሚማሜምሞሟሰሱሲሳሴስሶሷረሩሪራሬርሮሯበቡቢባቤብቦቧተቱቲታቴትቶቷأبتثجحخدذرزسشصضطظعغفقكلمنهوي';

export const DancingBaraLogo = () => {
  const [isRaining, setIsRaining] = useState(false);
  const [raindrops, setRaindrops] = useState<Array<{id: number, char: string, x: number, delay: number}>>([]);

  const handleHover = () => {
    setIsRaining(true);
    
    // Create 30 raindrops
    const drops = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      char: africanChars[Math.floor(Math.random() * africanChars.length)],
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setRaindrops(drops);
  };

  const handleHoverEnd = () => {
    setTimeout(() => {
      setIsRaining(false);
      setRaindrops([]);
    }, 2000);
  };

  return (
    <div 
      className="flex flex-col items-center gap-6 relative"
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverEnd}
    >
      {/* Falling African Characters */}
      <AnimatePresence>
        {isRaining && raindrops.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute text-2xl font-mono text-black pointer-events-none z-50"
            initial={{ x: `${drop.x}%`, y: -50, opacity: 1, rotate: 0 }}
            animate={{ 
              y: 500, 
              opacity: [1, 1, 0],
              rotate: Math.random() * 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2 + Math.random(), 
              delay: drop.delay,
              ease: "linear" 
            }}
          >
            {drop.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Top Row: Africa × B - All Dancing */}
      <div className="flex items-center gap-8">
        {/* Africa Map - Dancing */}
        <motion.div
          animate={{
            y: [0, -15, 0, -10, 0],
            rotate: [0, -5, 0, 5, 0],
            scale: [1, 1.05, 1, 1.03, 1],
          }}
          transition={{
            duration: 4,
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

        {/* × Symbol - Dancing */}
        <motion.div
          className="text-black text-5xl font-light"
          animate={{
            scale: [1, 1.3, 1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ×
        </motion.div>

        {/* B Lettermark - Dancing (opposite rhythm) */}
        <motion.div
          animate={{
            y: [0, -10, 0, -15, 0],
            rotate: [0, 5, 0, -5, 0],
            scale: [1, 1.03, 1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5, // Offset for variety
          }}
        >
          <img 
            src="/images/b-lettermark.png" 
            alt="B Lettermark Logo"
            className="w-28 h-auto drop-shadow-xl"
          />
        </motion.div>
      </div>

      {/* BARA Text - Gentle Float */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img 
          src="/images/bara-text.png" 
          alt="BARA Logo"
          className="w-80 h-auto drop-shadow-lg"
        />
        <motion.p 
          className="text-center text-xs text-gray-500 tracking-[0.3em] uppercase mt-2"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          We Are Together
        </motion.p>
      </motion.div>
    </div>
  );
};
