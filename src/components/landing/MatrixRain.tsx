import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  className?: string;
}

export const MatrixRain = ({ className = '' }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // African language characters (Swahili, Amharic, Arabic, etc.)
    const characters = 'ሀሁሂሃሄህሆለሉሊላልልሎሏመሙሚማሜምሞሟሰሱሲሳሴስሶሷረሩሪራሬርሮሯበቡቢባቤብቦቧተቱቲታቴትቶቷ';
    const latinChars = 'BARAAFRIKA0123456789';
    const arabicChars = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
    const allChars = characters + latinChars + arabicChars;
    
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    // Colors: gold and green
    const colors = ['#FFD700', '#00FF00', '#32CD32', '#FFB700'];

    const draw = () => {
      // Semi-transparent black for fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = allChars[Math.floor(Math.random() * allChars.length)];
        
        // Random color from palette
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px monospace`;
        
        // Draw character
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(char, x, y);

        // Reset drop to top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Move drop down
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ opacity: 0.3 }}
    />
  );
};
