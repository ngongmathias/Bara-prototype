import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  char?: string;
}

const africanChars = 'ሀሁሂሃሄህሆለሉሊላልልሎሏመሙሚማሜምሞሟሰሱሲሳሴስሶሷረሩሪራሬርሮሯበቡቢባቤብቦቧተቱቲታቴትቶቷأبتثجحخدذرزسشصضطظعغفقكلمنهوي';

export const GlitchAssemblyLogo = () => {
  const [isAssembled, setIsAssembled] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [scanLinePosition, setScanLinePosition] = useState(0);
  const [africaParticles, setAfricaParticles] = useState<Particle[]>([]);
  const [bParticles, setBParticles] = useState<Particle[]>([]);
  const [showChars, setShowChars] = useState(false);
  const [fallingChars, setFallingChars] = useState<Array<{id: number, char: string, x: number, y: number}>>([]);

  // Initialize particles on mount
  useEffect(() => {
    // Create particles for Africa logo
    const africaParts: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      targetX: 0,
      targetY: 0,
    }));
    setAfricaParticles(africaParts);

    // Create particles for B logo
    const bParts: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      targetX: 0,
      targetY: 0,
    }));
    setBParticles(bParts);

    // Assemble after a moment
    setTimeout(() => setIsAssembled(true), 500);
  }, []);

  // Continuous scan line animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLinePosition(prev => (prev >= 100 ? 0 : prev + 1));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Handle hover - trigger glitch and character rain
  const handleHover = () => {
    setIsGlitching(true);
    setShowChars(true);
    
    // Create falling characters
    const chars = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      char: africanChars[Math.floor(Math.random() * africanChars.length)],
      x: Math.random() * 100,
      y: -20,
    }));
    setFallingChars(chars);

    // Reset after animation
    setTimeout(() => {
      setIsGlitching(false);
      setShowChars(false);
      setFallingChars([]);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Scan Line Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent opacity-30"
          style={{ top: `${scanLinePosition}%` }}
        />
      </div>

      {/* Falling African Characters */}
      <AnimatePresence>
        {showChars && fallingChars.map((item) => (
          <motion.div
            key={item.id}
            className="absolute text-2xl font-mono text-black pointer-events-none"
            initial={{ x: `${item.x}%`, y: -50, opacity: 1 }}
            animate={{ y: 400, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "linear" }}
          >
            {item.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Top Row: Africa × B */}
      <div className="flex items-center gap-8 relative">
        {/* Africa Map - Particle Assembly */}
        <motion.div
          className="relative w-28 h-28"
          onHoverStart={handleHover}
        >
          {/* Particle overlay when not assembled or glitching */}
          {(!isAssembled || isGlitching) && (
            <div className="absolute inset-0">
              {africaParticles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-1 h-1 bg-black rounded-full"
                  initial={{ x: particle.x, y: particle.y, opacity: 1 }}
                  animate={{
                    x: isAssembled && !isGlitching ? particle.targetX : particle.x,
                    y: isAssembled && !isGlitching ? particle.targetY : particle.y,
                    opacity: isAssembled && !isGlitching ? 0 : 1,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              ))}
            </div>
          )}

          {/* Actual logo with glitch effect */}
          <motion.div
            animate={{
              opacity: isGlitching ? [1, 0.3, 1, 0.5, 1] : 1,
              x: isGlitching ? [0, -2, 2, -1, 0] : 0,
              filter: isGlitching ? [
                'hue-rotate(0deg)',
                'hue-rotate(90deg)',
                'hue-rotate(0deg)',
              ] : 'hue-rotate(0deg)',
            }}
            transition={{ duration: 0.3, repeat: isGlitching ? 3 : 0 }}
          >
            <img 
              src="/images/africa-map.png" 
              alt="Africa Map Logo"
              className="w-28 h-auto drop-shadow-xl"
            />
          </motion.div>

          {/* Glitch layers */}
          {isGlitching && (
            <>
              <motion.img 
                src="/images/africa-map.png" 
                alt=""
                className="absolute inset-0 w-28 h-auto opacity-50 mix-blend-screen"
                animate={{ x: [-3, 3, -2], opacity: [0.5, 0.3, 0.5] }}
                transition={{ duration: 0.2, repeat: 5 }}
              />
              <motion.img 
                src="/images/africa-map.png" 
                alt=""
                className="absolute inset-0 w-28 h-auto opacity-50 mix-blend-multiply"
                animate={{ x: [2, -2, 3], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 0.2, repeat: 5, delay: 0.1 }}
              />
            </>
          )}
        </motion.div>

        {/* × Symbol - Glitches too */}
        <motion.div
          className="text-black text-5xl font-light relative"
          animate={{
            opacity: isGlitching ? [1, 0.5, 1] : 1,
            scale: isGlitching ? [1, 1.2, 0.9, 1] : 1,
          }}
          transition={{ duration: 0.3, repeat: isGlitching ? 3 : 0 }}
        >
          ×
          {/* Glitch text layers */}
          {isGlitching && (
            <>
              <span className="absolute inset-0 text-red-500 opacity-50" style={{ transform: 'translate(-2px, 0)' }}>×</span>
              <span className="absolute inset-0 text-blue-500 opacity-50" style={{ transform: 'translate(2px, 0)' }}>×</span>
            </>
          )}
        </motion.div>

        {/* B Lettermark - Particle Assembly */}
        <motion.div
          className="relative w-28 h-28"
          onHoverStart={handleHover}
        >
          {/* Particle overlay */}
          {(!isAssembled || isGlitching) && (
            <div className="absolute inset-0">
              {bParticles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-1 h-1 bg-black rounded-full"
                  initial={{ x: particle.x, y: particle.y, opacity: 1 }}
                  animate={{
                    x: isAssembled && !isGlitching ? particle.targetX : particle.x,
                    y: isAssembled && !isGlitching ? particle.targetY : particle.y,
                    opacity: isAssembled && !isGlitching ? 0 : 1,
                  }}
                  transition={{ duration: 1, ease: "easeOut", delay: particle.id * 0.01 }}
                />
              ))}
            </div>
          )}

          {/* Actual logo with glitch effect */}
          <motion.div
            animate={{
              opacity: isGlitching ? [1, 0.3, 1, 0.5, 1] : 1,
              x: isGlitching ? [0, 2, -2, 1, 0] : 0,
              filter: isGlitching ? [
                'hue-rotate(0deg)',
                'hue-rotate(-90deg)',
                'hue-rotate(0deg)',
              ] : 'hue-rotate(0deg)',
            }}
            transition={{ duration: 0.3, repeat: isGlitching ? 3 : 0 }}
          >
            <img 
              src="/images/b-lettermark.png" 
              alt="B Lettermark Logo"
              className="w-28 h-auto drop-shadow-xl"
            />
          </motion.div>

          {/* Glitch layers */}
          {isGlitching && (
            <>
              <motion.img 
                src="/images/b-lettermark.png" 
                alt=""
                className="absolute inset-0 w-28 h-auto opacity-50 mix-blend-screen"
                animate={{ x: [3, -3, 2], opacity: [0.5, 0.3, 0.5] }}
                transition={{ duration: 0.2, repeat: 5 }}
              />
              <motion.img 
                src="/images/b-lettermark.png" 
                alt=""
                className="absolute inset-0 w-28 h-auto opacity-50 mix-blend-multiply"
                animate={{ x: [-2, 2, -3], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 0.2, repeat: 5, delay: 0.1 }}
              />
            </>
          )}
        </motion.div>
      </div>

      {/* BARA Text - Glitch on hover */}
      <motion.div
        animate={{
          opacity: isGlitching ? [1, 0.7, 1] : 1,
        }}
      >
        <div className="relative">
          <img 
            src="/images/bara-text.png" 
            alt="BARA Logo"
            className="w-80 h-auto drop-shadow-lg relative z-10"
          />
          {/* Glitch layers for BARA text */}
          {isGlitching && (
            <>
              <motion.img 
                src="/images/bara-text.png" 
                alt=""
                className="absolute inset-0 w-80 h-auto opacity-40"
                animate={{ x: [-4, 4], y: [0, 2] }}
                transition={{ duration: 0.1, repeat: 10 }}
                style={{ filter: 'hue-rotate(180deg)' }}
              />
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-500 tracking-[0.3em] uppercase mt-2">
          We Are Together
        </p>
      </motion.div>
    </div>
  );
};
