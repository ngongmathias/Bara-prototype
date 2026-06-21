import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BARA_MEANINGS = [
  { language: 'Swahili', meaning: 'Blessing' },
  { language: 'Hausa', meaning: 'Gift' },
  { language: 'Yoruba', meaning: 'Wonder' },
  { language: 'Amharic', meaning: 'Gateway' },
  { language: 'Zulu', meaning: 'To Grasp' },
  { language: 'Arabic', meaning: 'Land' },
];

export const DancingBaraLogo = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 relative">
      <div
        className="cursor-pointer"
        style={{ perspective: 1200 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* ─── FRONT: Logo ─── */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
          >
            <Link
              to="/"
              className="flex flex-col items-center group"
              onClick={(e) => { if (!isFlipped) e.preventDefault(); }}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-sm rounded-3xl px-12 py-8 transition-all duration-300 group-hover:scale-105 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-transparent group-hover:border-gray-300"
              >
                {/* Top Row: Africa × B */}
                <div className="flex items-center gap-8 mb-6">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img loading="lazy" src="/images/africa-map.png" alt="Africa Map Logo" className="w-28 h-auto drop-shadow-xl" />
                  </motion.div>

                  <div className="text-black text-5xl font-light">×</div>

                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                  >
                    <img loading="lazy" src="/images/b-lettermark.png" alt="B Lettermark Logo" className="w-28 h-auto drop-shadow-xl" />
                  </motion.div>
                </div>

                {/* BARA Text */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="mt-4"
                >
                  <img loading="lazy" src="/images/bara-text.png" alt="BARA Logo" className="w-80 h-auto drop-shadow-lg mx-auto" />
                  <p className="text-center text-xs text-gray-500 tracking-[0.3em] uppercase mt-2">
                    We Are Together
                  </p>
                </motion.div>

                <p className="text-center text-[10px] text-gray-400 mt-4">Tap to discover what BARA means</p>
              </motion.div>
            </Link>
          </div>

          {/* ─── BACK: Bara meaning ─── */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="bg-gray-900 rounded-3xl px-10 py-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] h-full flex flex-col items-center justify-center text-center">
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed max-w-[300px] mb-3">
                <span className="font-black text-white">BARA</span> – Kiswahili (or Swahili) for continent, land, home.
              </p>
              <p className="text-base sm:text-lg font-bold text-white tracking-wide mb-3">
                One Land | One People | One Future
              </p>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-[300px] mb-4">
                With over 200 million speakers, Kiswahili is Africa's most far-reaching indigenous tongue.
              </p>
              <p className="text-white text-sm sm:text-base font-bold max-w-[300px] mb-1">
                BARA Afrika | “Your Bridge to Today's Afrika!”
              </p>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-[300px]">
                A pan-African super platform connecting the global Afrikan family through trade, tourism, networking, entertainment, and beyond.
              </p>
              <p className="text-gray-600 text-[10px] mt-4">Tap to flip back</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
