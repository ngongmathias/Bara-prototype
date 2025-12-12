import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const StaggeredGrid = ({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}: StaggeredGridProps) => {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: i * staggerDelay,
            type: "spring",
            stiffness: 100
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};
