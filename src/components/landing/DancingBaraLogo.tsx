import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const DancingBaraLogo = () => {
  return (
    <Link
      to="/"
      className="flex flex-col items-center gap-6 relative group cursor-pointer"
    >
      {/* All logos together in one card with elegant hover effect */}
      <motion.div
        className="bg-white/95 backdrop-blur-sm rounded-3xl px-12 py-8 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.25),0_0_40px_rgba(59,130,246,0.15)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-transparent group-hover:border-blue-500/30"
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
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
      </motion.div>
    </Link>
  );
};
