import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const InteractiveBaraLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animations
  const springConfig = { damping: 25, stiffness: 150 };
  const africaX = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), springConfig);
  const africaY = useSpring(useTransform(mouseY, [-300, 300], [-15, 15]), springConfig);
  const africaRotate = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), springConfig);
  
  const bX = useSpring(useTransform(mouseX, [-300, 300], [15, -15]), springConfig);
  const bY = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), springConfig);
  const bRotate = useSpring(useTransform(mouseX, [-300, 300], [5, -5]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col items-center gap-6 cursor-none"
    >
      {/* Custom Cursor */}
      {isHovered && (
        <motion.div
          className="fixed w-4 h-4 bg-black rounded-full pointer-events-none z-50 mix-blend-difference"
          style={{
            left: mouseX,
            top: mouseY,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        />
      )}

      {/* Top Row: Africa × B */}
      <div className="flex items-center gap-8 relative">
        {/* Connecting Lines Effect */}
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.2 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <line
            x1="25%"
            y1="50%"
            x2="50%"
            y2="50%"
            stroke="black"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="50%"
            y1="50%"
            x2="75%"
            y2="50%"
            stroke="black"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </motion.svg>

        {/* Africa Map - Magnetic Effect */}
        <motion.div
          style={{
            x: africaX,
            y: africaY,
            rotate: africaRotate,
          }}
          className="relative"
        >
          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-black rounded-full blur-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isHovered ? 0.1 : 0,
              scale: isHovered ? 1.2 : 0.8
            }}
            transition={{ duration: 0.4 }}
          />
          
          <motion.img 
            src="/images/africa-map.png" 
            alt="Africa Map Logo"
            className="w-28 h-auto drop-shadow-xl relative z-10"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          />
          
          {/* Particle dots around logo */}
          {isHovered && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-black rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i / 8) * Math.PI * 2) * 60,
                    y: Math.sin((i / 8) * Math.PI * 2) * 60,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* × Symbol - Pulses on hover */}
        <motion.div
          className="text-black text-5xl font-light relative z-10"
          animate={{
            scale: isHovered ? [1, 1.2, 1] : 1,
            opacity: isHovered ? [1, 0.5, 1] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: isHovered ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          ×
        </motion.div>

        {/* B Lettermark - Magnetic Effect (opposite direction) */}
        <motion.div
          style={{
            x: bX,
            y: bY,
            rotate: bRotate,
          }}
          className="relative"
        >
          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-black rounded-full blur-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isHovered ? 0.1 : 0,
              scale: isHovered ? 1.2 : 0.8
            }}
            transition={{ duration: 0.4 }}
          />
          
          <motion.img 
            src="/images/b-lettermark.png" 
            alt="B Lettermark Logo"
            className="w-28 h-auto drop-shadow-xl relative z-10"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          />
          
          {/* Particle dots around logo */}
          {isHovered && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-black rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i / 8) * Math.PI * 2) * 60,
                    y: Math.sin((i / 8) * Math.PI * 2) * 60,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1 + 0.5,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      </div>

      {/* BARA Text - Subtle float animation */}
      <motion.div
        animate={{
          y: isHovered ? [0, -5, 0] : 0,
        }}
        transition={{
          duration: 2,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <motion.img 
          src="/images/bara-text.png" 
          alt="BARA Logo"
          className="w-80 h-auto drop-shadow-lg"
          whileHover={{ scale: 1.02 }}
        />
        <motion.p 
          className="text-center text-xs text-gray-500 tracking-[0.3em] uppercase mt-2"
          animate={{
            opacity: isHovered ? [0.5, 1, 0.5] : 0.5,
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
          }}
        >
          We Are Together
        </motion.p>
      </motion.div>
    </div>
  );
};
