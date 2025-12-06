import { motion } from 'framer-motion';

export const ExactBaraLogo = () => {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Top Row: Africa × B */}
      <div className="flex items-center gap-12">
        {/* Africa Map with Fingerprint Texture */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <svg
            width="140"
            height="180"
            viewBox="0 0 140 180"
            className="drop-shadow-2xl"
          >
            {/* Africa silhouette - more accurate shape */}
            <defs>
              <clipPath id="africaClip">
                <path d="M 70 20 
                         C 75 20, 80 22, 83 25
                         L 88 32
                         C 92 38, 95 45, 97 52
                         L 100 65
                         C 102 75, 103 85, 102 95
                         L 100 110
                         C 98 122, 95 133, 90 142
                         L 85 150
                         C 80 157, 73 162, 65 165
                         L 55 167
                         C 47 167, 40 165, 35 160
                         L 28 152
                         C 23 144, 20 135, 18 125
                         L 16 110
                         C 15 100, 15 90, 17 80
                         L 20 68
                         C 22 58, 25 48, 30 40
                         L 35 32
                         C 40 25, 48 20, 56 20
                         Z" />
              </clipPath>
            </defs>
            
            {/* Base Africa shape */}
            <path 
              d="M 70 20 
                 C 75 20, 80 22, 83 25
                 L 88 32
                 C 92 38, 95 45, 97 52
                 L 100 65
                 C 102 75, 103 85, 102 95
                 L 100 110
                 C 98 122, 95 133, 90 142
                 L 85 150
                 C 80 157, 73 162, 65 165
                 L 55 167
                 C 47 167, 40 165, 35 160
                 L 28 152
                 C 23 144, 20 135, 18 125
                 L 16 110
                 C 15 100, 15 90, 17 80
                 L 20 68
                 C 22 58, 25 48, 30 40
                 L 35 32
                 C 40 25, 48 20, 56 20
                 Z"
              fill="#1a1a1a"
              stroke="#fff"
              strokeWidth="2"
            />
            
            {/* Fingerprint/topographic lines texture */}
            <g clipPath="url(#africaClip)">
              {/* Curved concentric lines mimicking fingerprint */}
              <path d="M 30 40 Q 60 35, 90 40" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 28 48 Q 60 43, 92 48" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 26 56 Q 60 51, 94 56" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 25 64 Q 60 59, 95 64" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 24 72 Q 60 67, 96 72" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 23 80 Q 60 75, 97 80" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 22 88 Q 60 83, 98 88" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 21 96 Q 60 91, 99 96" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 22 104 Q 60 99, 98 104" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 23 112 Q 60 107, 97 112" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 24 120 Q 60 115, 96 120" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 26 128 Q 60 123, 94 128" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 28 136 Q 60 131, 92 136" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 30 144 Q 60 139, 90 144" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
              <path d="M 35 152 Q 60 147, 85 152" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8"/>
            </g>
          </svg>
        </motion.div>

        {/* × Symbol */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-white text-6xl font-light"
        >
          ×
        </motion.div>

        {/* B Lettermark - Bold and Rounded with Africa Inside */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <svg
            width="140"
            height="180"
            viewBox="0 0 140 180"
            className="drop-shadow-2xl"
          >
            <defs>
              <clipPath id="bLetterClip">
                {/* Bold B shape */}
                <path d="M 30 30 
                         L 30 150
                         L 85 150
                         C 100 150, 110 142, 112 130
                         C 114 120, 110 110, 100 105
                         C 108 100, 112 90, 110 80
                         C 108 68, 98 30, 80 30
                         Z
                         M 50 50
                         L 75 50
                         C 85 50, 92 56, 92 65
                         C 92 74, 85 80, 75 80
                         L 50 80
                         Z
                         M 50 95
                         L 80 95
                         C 90 95, 97 101, 97 112
                         C 97 123, 90 130, 80 130
                         L 50 130
                         Z" />
              </clipPath>
            </defs>
            
            {/* B Letter Outline - Bold */}
            <path 
              d="M 30 30 
                 L 30 150
                 L 85 150
                 C 100 150, 110 142, 112 130
                 C 114 120, 110 110, 100 105
                 C 108 100, 112 90, 110 80
                 C 108 68, 98 30, 80 30
                 Z
                 M 50 50
                 L 75 50
                 C 85 50, 92 56, 92 65
                 C 92 74, 85 80, 75 80
                 L 50 80
                 Z
                 M 50 95
                 L 80 95
                 C 90 95, 97 101, 97 112
                 C 97 123, 90 130, 80 130
                 L 50 130
                 Z"
              fill="#000"
              stroke="#fff"
              strokeWidth="3"
            />
            
            {/* Small Africa inside B - with fingerprint texture */}
            <g clipPath="url(#bLetterClip)">
              <ellipse cx="70" cy="90" rx="18" ry="28" fill="#2d5016" opacity="0.9"/>
              {/* Mini fingerprint lines */}
              <path d="M 55 70 Q 70 68, 85 70" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M 54 76 Q 70 74, 86 76" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M 53 82 Q 70 80, 87 82" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M 53 88 Q 70 86, 87 88" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M 53 94 Q 70 92, 87 94" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M 54 100 Q 70 98, 86 100" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M 55 106 Q 70 104, 85 106" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.6"/>
            </g>
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
        <div className="text-8xl font-black text-white tracking-tight mb-2">
          BARA
        </div>
        <div className="text-sm text-gray-400 tracking-[0.3em] uppercase font-light">
          We Are Together
        </div>
      </motion.div>
    </div>
  );
};
