import { motion } from 'framer-motion';

export const RealBaraLogo = () => {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Top Row: Africa × B */}
      <div className="flex items-center gap-12">
        {/* Africa Map - Real Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <img 
            src="/images/africa-map.png" 
            alt="Africa Map Logo"
            className="w-32 h-auto drop-shadow-2xl"
          />
        </motion.div>

        {/* × Symbol */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-white text-6xl font-light"
        >
          ×
        </motion.div>

        {/* B Lettermark - Real Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <img 
            src="/images/b-lettermark.png" 
            alt="B Lettermark Logo"
            className="w-32 h-auto drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Bottom: BARA Text - Real Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <img 
          src="/images/bara-text.png" 
          alt="BARA Logo"
          className="w-96 h-auto drop-shadow-2xl mx-auto mb-4"
        />
        <div className="text-sm text-gray-400 tracking-[0.3em] uppercase font-light">
          We Are Together
        </div>
      </motion.div>
    </div>
  );
};
