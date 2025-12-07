import { motion } from 'framer-motion';

export const DancingBaraLogo = () => {
  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Top Row: Africa × B - Subtle Professional Motion */}
      <div className="flex items-center gap-8 bg-white/95 backdrop-blur-sm rounded-3xl px-12 py-8 shadow-2xl">
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
        className="bg-white/95 backdrop-blur-sm rounded-3xl px-12 py-6 shadow-2xl"
      >
        <img 
          src="/images/bara-text.png" 
          alt="BARA Logo"
          className="w-80 h-auto drop-shadow-lg"
        />
        <p className="text-center text-xs text-gray-500 tracking-[0.3em] uppercase mt-2">
          We Are Together
        </p>
      </motion.div>
    </div>
  );
};
