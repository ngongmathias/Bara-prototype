import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface DrippingChar {
  char: string;
  x: number;
  y: number;
  speed: number;
  opacity: number;
}

export const InteractiveLogo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [drippingChars, setDrippingChars] = useState<DrippingChar[]>([]);
  const animationRef = useRef<number>();

  // African characters for dripping effect
  const africanChars = 'ሀሁሂሃሄህሆለሉሊላልልሎሏመሙሚማሜምሞሟሰሱሲሳሴስሶሷረሩሪራሬርሮሯበቡቢባቤብቦቧተቱቲታቴትቶቷأبتثجحخدذرزسشصضطظعغفقكلمنهوي';

  useEffect(() => {
    if (!isHovered) {
      setDrippingChars([]);
      return;
    }

    // Create dripping characters when hovered
    const interval = setInterval(() => {
      const newChar: DrippingChar = {
        char: africanChars[Math.floor(Math.random() * africanChars.length)],
        x: Math.random() * 400, // Spread across logo width
        y: 0,
        speed: 2 + Math.random() * 3,
        opacity: 1,
      };
      setDrippingChars(prev => [...prev, newChar]);
    }, 100);

    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    const animate = () => {
      setDrippingChars(prev => 
        prev
          .map(char => ({
            ...char,
            y: char.y + char.speed,
            opacity: char.opacity - 0.01,
          }))
          .filter(char => char.y < 500 && char.opacity > 0)
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dripping Characters Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {drippingChars.map((char, i) => (
          <div
            key={i}
            className="absolute text-gold-400 font-mono text-xl"
            style={{
              left: `${char.x}px`,
              top: `${char.y}px`,
              opacity: char.opacity,
            }}
          >
            {char.char}
          </div>
        ))}
      </div>

      {/* Logo Structure: Africa × B = BARA */}
      <div className="flex flex-col items-center gap-6">
        {/* Top Row: Africa × B */}
        <div className="flex items-center gap-8">
          {/* Africa Map with Stripes */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="drop-shadow-2xl"
            >
              {/* Africa silhouette */}
              <path
                d="M60 10 C75 13, 85 20, 90 30 L93 42 C96 51, 99 60, 99 69 L96 84 C93 96, 87 105, 78 111 L66 114 C54 113, 42 108, 33 99 L27 87 C24 75, 23 63, 24 51 L27 39 C30 27, 39 18, 51 13 Z"
                fill="#FFD700"
                className="drop-shadow-lg"
              />
              {/* Horizontal stripes */}
              <g opacity="0.4">
                {[...Array(20)].map((_, i) => (
                  <rect
                    key={i}
                    x="24"
                    y={18 + i * 5}
                    width="72"
                    height="2"
                    fill="#000"
                  />
                ))}
              </g>
            </svg>
          </motion.div>

          {/* × Symbol */}
          <motion.div
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-gold-400 text-5xl font-bold"
          >
            ×
          </motion.div>

          {/* B Lettermark with Africa inside */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="drop-shadow-2xl"
            >
              {/* B Letter */}
              <path
                d="M25 15 L25 105 L65 105 C78 105, 87 98, 90 87 C93 78, 90 69, 81 63 C87 57, 89 48, 86 39 C83 30, 75 15, 63 15 Z M40 30 L60 30 C69 30, 75 36, 75 42 C75 48, 69 54, 60 54 L40 54 Z M40 66 L63 66 C72 66, 78 72, 78 81 C78 90, 72 93, 63 93 L40 93 Z"
                fill="#000"
                stroke="#FFD700"
                strokeWidth="3"
                className="drop-shadow-lg"
              />
              {/* Small Africa inside B */}
              <path
                d="M51 36 C54 37, 57 39, 59 42 L60 48 C61 52, 62 57, 61 61 L60 69 C59 73, 56 77, 53 79 L48 81 C44 80, 40 78, 37 74 L36 69 C35 65, 34 60, 35 55 L36 49 C37 43, 42 38, 47 37 Z"
                fill="#32CD32"
                opacity="0.9"
              />
            </svg>
          </motion.div>
        </div>

        {/* Bottom: BARA Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="text-7xl font-bold text-white tracking-wider mb-2 drop-shadow-2xl">
            BARA
          </div>
          <div className="text-sm text-gray-300 tracking-widest uppercase">
            We Are Together
          </div>
        </motion.div>
      </div>
    </div>
  );
};
