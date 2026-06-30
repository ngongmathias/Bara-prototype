import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MousePointerClick } from 'lucide-react';

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
                  <img loading="lazy" src="/images/bara-text.png" alt="BARA Logo" className="w-72 sm:w-80 h-auto drop-shadow-lg mx-auto" />
                </motion.div>

                {/* What BARA does — one tight line, sized to span ~the BARA wordmark width */}
                <p className="text-center font-roboto font-black text-gray-900 text-[1.4rem] sm:text-[1.6rem] leading-tight mt-4 whitespace-nowrap">
                  Connecting Global Afrika
                </p>

                {/* Obvious call-to-action */}
                <div className="flex justify-center mt-5">
                  <motion.span
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center gap-2 bg-gray-900 text-white font-roboto font-medium text-sm sm:text-base px-5 py-2 rounded-full shadow-lg"
                  >
                    <MousePointerClick size={18} /> Tap to discover BARA
                  </motion.span>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* ─── BACK: Bara meaning ─── */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="bg-gray-900 rounded-3xl px-10 py-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] h-full flex flex-col items-center justify-center text-center">
              <p className="font-roboto text-white text-lg sm:text-xl leading-relaxed max-w-[320px] mb-5">
                <span className="font-black">BARA:</span> Swahili <span className="text-gray-300">(noun)</span>
                <br />
                <span className="font-black whitespace-nowrap">Continent | Land | Home</span>
              </p>
              <p className="font-roboto text-gray-200 text-sm sm:text-base leading-relaxed max-w-[330px] mb-6">
                A pan-African <span className="font-black text-white">“SuperPlatform”</span> connecting global Afrika through Trade, Tourism, Networking, Entertainment &amp; More.
              </p>
              <p className="font-roboto font-medium text-white text-sm sm:text-base">
                Scroll to discover BARA's functions!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
