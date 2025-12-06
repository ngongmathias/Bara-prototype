export const AfricaMapLogo = ({ className = "w-32 h-32" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Africa continent silhouette with horizontal stripes */}
      <g>
        {/* Simplified Africa shape */}
        <path
          d="M100 20 C120 25, 140 35, 150 50 L155 70 C160 85, 165 100, 165 115 L160 140 C155 160, 145 175, 130 185 L110 190 C90 188, 70 180, 55 165 L45 145 C40 125, 38 105, 40 85 L45 65 C50 45, 65 30, 85 22 Z"
          fill="#FFD700"
          opacity="0.9"
        />
        {/* Horizontal stripes overlay */}
        <g opacity="0.3">
          <rect x="40" y="30" width="120" height="4" fill="#000" />
          <rect x="40" y="40" width="120" height="4" fill="#000" />
          <rect x="40" y="50" width="120" height="4" fill="#000" />
          <rect x="40" y="60" width="120" height="4" fill="#000" />
          <rect x="40" y="70" width="120" height="4" fill="#000" />
          <rect x="40" y="80" width="120" height="4" fill="#000" />
          <rect x="40" y="90" width="120" height="4" fill="#000" />
          <rect x="40" y="100" width="120" height="4" fill="#000" />
          <rect x="40" y="110" width="120" height="4" fill="#000" />
          <rect x="40" y="120" width="120" height="4" fill="#000" />
          <rect x="40" y="130" width="120" height="4" fill="#000" />
          <rect x="40" y="140" width="120" height="4" fill="#000" />
          <rect x="40" y="150" width="120" height="4" fill="#000" />
          <rect x="40" y="160" width="120" height="4" fill="#000" />
          <rect x="40" y="170" width="120" height="4" fill="#000" />
          <rect x="40" y="180" width="120" height="4" fill="#000" />
        </g>
      </g>
    </svg>
  );
};

export const BLettermarkLogo = ({ className = "w-48 h-48" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Large "B" with Africa inside */}
      <g>
        {/* B letter outline */}
        <path
          d="M40 30 L40 170 L110 170 C130 170, 145 160, 150 145 C155 130, 150 115, 135 105 C145 95, 148 80, 143 65 C138 50, 125 30, 105 30 Z M60 50 L100 50 C115 50, 125 60, 125 70 C125 80, 115 90, 100 90 L60 90 Z M60 110 L105 110 C120 110, 130 120, 130 135 C130 150, 120 155, 105 155 L60 155 Z"
          fill="#000"
          stroke="#FFD700"
          strokeWidth="3"
        />
        {/* Small Africa map inside B */}
        <path
          d="M85 60 C90 62, 95 65, 98 70 L100 80 C102 87, 103 95, 102 102 L100 115 C98 122, 94 128, 88 132 L80 135 C73 134, 67 130, 63 124 L60 115 C58 108, 57 100, 58 92 L60 82 C62 72, 70 63, 78 61 Z"
          fill="#32CD32"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};

export const BaraTextLogo = ({ className = "text-white" }: { className?: string }) => {
  return (
    <div className={`font-bold ${className}`}>
      <div className="text-6xl md:text-8xl tracking-wider mb-2">BARA</div>
      <div className="text-lg md:text-xl tracking-widest font-light">WE ARE TOGETHER</div>
    </div>
  );
};
