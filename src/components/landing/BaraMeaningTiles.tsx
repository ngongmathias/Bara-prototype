import { useState } from 'react';
import { motion } from 'framer-motion';

interface BaraTile {
  language: string;
  meaning: string;
  region: string;
}

const BARA_MEANINGS: BaraTile[] = [
  { language: 'Swahili', meaning: 'Blessing', region: 'East Africa' },
  { language: 'Hausa', meaning: 'Gift / Charity', region: 'West Africa' },
  { language: 'Yoruba', meaning: 'Wonder', region: 'Nigeria' },
  { language: 'Amharic', meaning: 'Door / Gateway', region: 'Ethiopia' },
  { language: 'Zulu', meaning: 'To grasp / Hold', region: 'South Africa' },
  { language: 'Arabic', meaning: 'Land / Wilderness', region: 'North Africa' },
];

export function BaraMeaningTiles() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-3xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">What does "Bara" mean?</h2>
        <p className="text-sm text-gray-500">Tap to discover</p>
      </div>

      <motion.button
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full cursor-pointer"
        style={{ perspective: 1000 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="relative w-full grid"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Front — Language meanings grid */}
          <div
            className="[grid-area:1/1] w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BARA_MEANINGS.map((tile) => (
                <div key={tile.language} className="text-center py-3">
                  <span className="text-xl font-bold text-gray-900 tracking-tight block">BARA</span>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">{tile.language}</span>
                  <span className="text-sm text-gray-600 block mt-1">{tile.meaning}</span>
                  <span className="text-[10px] text-gray-400">{tile.region}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">Tap to discover what Bara means</p>
          </div>

          {/* Back — Unified BARA message */}
          <div
            className="[grid-area:1/1] w-full rounded-2xl border border-gray-900 bg-gray-900 text-white flex flex-col items-center justify-center text-center px-6 py-6 sm:px-8"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed mb-3">
              <span className="font-black text-white">BARA</span> – Kiswahili (or Swahili) for continent, land, home.
            </p>
            <p className="text-base sm:text-lg font-bold text-white tracking-wide mb-3">
              One Land | One People | One Future
            </p>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
              With over 200 million speakers, Kiswahili is Africa's most far-reaching indigenous tongue.
            </p>
            <p className="text-sm sm:text-base font-bold text-white mb-1">
              BARA Afrika | “Your Bridge to Today's Afrika!”
            </p>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              A pan-African super platform connecting the global Afrikan family through trade, tourism, networking, entertainment, and beyond.
            </p>
          </div>
        </motion.div>
      </motion.button>
    </div>
  );
}
