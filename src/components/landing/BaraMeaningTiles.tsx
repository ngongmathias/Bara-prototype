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
  const [flippedTiles, setFlippedTiles] = useState<Set<number>>(new Set());

  const toggleFlip = (index: number) => {
    setFlippedTiles(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">What does "Bara" mean?</h2>
        <p className="text-sm text-gray-500">Tap a tile to reveal its meaning</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BARA_MEANINGS.map((tile, index) => {
          const isFlipped = flippedTiles.has(index);
          return (
            <motion.button
              key={tile.language}
              onClick={() => toggleFlip(index)}
              className="relative h-28 w-full cursor-pointer"
              style={{ perspective: 800 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <motion.div
                className="absolute inset-0 w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {/* Front — Language */}
                <div
                  className="absolute inset-0 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-shadow"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">BARA</span>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">{tile.language}</span>
                </div>

                {/* Back — Meaning */}
                <div
                  className="absolute inset-0 rounded-xl border border-gray-900 bg-gray-900 text-white flex flex-col items-center justify-center gap-1 px-3"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-lg font-bold text-center leading-tight">{tile.meaning}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">{tile.region}</span>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
