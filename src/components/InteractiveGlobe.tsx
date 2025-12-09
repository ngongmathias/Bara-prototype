import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Country {
  id: string;
  name: string;
  code: string;
  slug: string;
  latitude?: number;
  longitude?: number;
}

interface InteractiveGlobeProps {
  countries: Country[];
  onCountryClick: (country: Country) => void;
  selectedCountry?: Country | null;
}

// African country coordinates
const AFRICAN_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'algeria': { lat: 28.0339, lng: 1.6596 },
  'angola': { lat: -11.2027, lng: 17.8739 },
  'benin': { lat: 9.3077, lng: 2.3158 },
  'botswana': { lat: -22.3285, lng: 24.6849 },
  'burkina-faso': { lat: 12.2383, lng: -1.5616 },
  'burundi': { lat: -3.3731, lng: 29.9189 },
  'cameroon': { lat: 7.3697, lng: 12.3547 },
  'cape-verde': { lat: 16.5388, lng: -23.0418 },
  'central-african-republic': { lat: 6.6111, lng: 20.9394 },
  'chad': { lat: 15.4542, lng: 18.7322 },
  'comoros': { lat: -11.6455, lng: 43.3333 },
  'congo': { lat: -0.228, lng: 15.8277 },
  'democratic-republic-of-the-congo': { lat: -4.0383, lng: 21.7587 },
  'djibouti': { lat: 11.8251, lng: 42.5903 },
  'egypt': { lat: 26.8206, lng: 30.8025 },
  'equatorial-guinea': { lat: 1.6508, lng: 10.2679 },
  'eritrea': { lat: 15.1794, lng: 39.7823 },
  'eswatini': { lat: -26.5225, lng: 31.4659 },
  'ethiopia': { lat: 9.145, lng: 40.4897 },
  'gabon': { lat: -0.8037, lng: 11.6094 },
  'gambia': { lat: 13.4432, lng: -15.3101 },
  'ghana': { lat: 7.9465, lng: -1.0232 },
  'guinea': { lat: 9.9456, lng: -9.6966 },
  'guinea-bissau': { lat: 11.8037, lng: -15.1804 },
  'ivory-coast': { lat: 7.54, lng: -5.5471 },
  'cote-divoire': { lat: 7.54, lng: -5.5471 },
  'kenya': { lat: -0.0236, lng: 37.9062 },
  'lesotho': { lat: -29.6099, lng: 28.2336 },
  'liberia': { lat: 6.4281, lng: -9.4295 },
  'libya': { lat: 26.3351, lng: 17.2283 },
  'madagascar': { lat: -18.7669, lng: 46.8691 },
  'malawi': { lat: -13.2543, lng: 34.3015 },
  'mali': { lat: 17.5707, lng: -3.9962 },
  'mauritania': { lat: 21.0079, lng: -10.9408 },
  'mauritius': { lat: -20.3484, lng: 57.5522 },
  'morocco': { lat: 31.7917, lng: -7.0926 },
  'mozambique': { lat: -18.6657, lng: 35.5296 },
  'namibia': { lat: -22.9576, lng: 18.4904 },
  'niger': { lat: 17.6078, lng: 8.0817 },
  'nigeria': { lat: 9.082, lng: 8.6753 },
  'rwanda': { lat: -1.9403, lng: 29.8739 },
  'sao-tome-and-principe': { lat: 0.1864, lng: 6.6131 },
  'senegal': { lat: 14.4974, lng: -14.4524 },
  'seychelles': { lat: -4.6796, lng: 55.492 },
  'sierra-leone': { lat: 8.4606, lng: -11.7799 },
  'somalia': { lat: 5.1521, lng: 46.1996 },
  'south-africa': { lat: -30.5595, lng: 22.9375 },
  'south-sudan': { lat: 6.877, lng: 31.307 },
  'sudan': { lat: 12.8628, lng: 30.2176 },
  'tanzania': { lat: -6.369, lng: 34.8888 },
  'togo': { lat: 8.6195, lng: 0.8248 },
  'tunisia': { lat: 33.8869, lng: 9.5375 },
  'uganda': { lat: 1.3733, lng: 32.2903 },
  'zambia': { lat: -13.1339, lng: 27.8493 },
  'zimbabwe': { lat: -19.0154, lng: 29.1549 },
};

// Default African countries to show on globe even if data isn't loaded
const DEFAULT_COUNTRIES: Country[] = [
  { id: '1', name: 'Nigeria', code: 'NG', slug: 'nigeria' },
  { id: '2', name: 'Kenya', code: 'KE', slug: 'kenya' },
  { id: '3', name: 'Ghana', code: 'GH', slug: 'ghana' },
  { id: '4', name: 'South Africa', code: 'ZA', slug: 'south-africa' },
  { id: '5', name: 'Egypt', code: 'EG', slug: 'egypt' },
  { id: '6', name: 'Ethiopia', code: 'ET', slug: 'ethiopia' },
  { id: '7', name: 'Tanzania', code: 'TZ', slug: 'tanzania' },
  { id: '8', name: 'Rwanda', code: 'RW', slug: 'rwanda' },
  { id: '9', name: 'Uganda', code: 'UG', slug: 'uganda' },
  { id: '10', name: 'Morocco', code: 'MA', slug: 'morocco' },
  { id: '11', name: 'Algeria', code: 'DZ', slug: 'algeria' },
  { id: '12', name: 'Tunisia', code: 'TN', slug: 'tunisia' },
  { id: '13', name: 'Senegal', code: 'SN', slug: 'senegal' },
  { id: '14', name: 'Cameroon', code: 'CM', slug: 'cameroon' },
  { id: '15', name: 'Zimbabwe', code: 'ZW', slug: 'zimbabwe' },
];

export const InteractiveGlobe = ({ countries, onCountryClick, selectedCountry }: InteractiveGlobeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const animationRef = useRef<number>();
  const autoRotateRef = useRef(true);

  // Use provided countries or fallback to defaults
  const displayCountries = countries.length > 0 ? countries : DEFAULT_COUNTRIES;

  // Get coordinates for a country
  const getCountryCoords = (country: Country) => {
    const slug = country.slug?.toLowerCase() || country.name.toLowerCase().replace(/\s+/g, '-');
    return AFRICAN_COORDINATES[slug] || { lat: 0, lng: 20 };
  };

  // Convert lat/lng to 3D coordinates on sphere
  const latLngTo3D = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return {
      x: -(radius * Math.sin(phi) * Math.cos(theta)),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta),
    };
  };

  // Rotate point around Y axis then X axis
  const rotatePoint = (point: { x: number; y: number; z: number }, rotX: number, rotY: number) => {
    // Rotate around Y
    let x = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
    let z = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
    let y = point.y;

    // Rotate around X
    const newY = y * Math.cos(rotX) - z * Math.sin(rotX);
    const newZ = y * Math.sin(rotX) + z * Math.cos(rotX);

    return { x, y: newY, z: newZ };
  };

  // Country points with their 3D positions
  const countryPoints = useMemo(() => {
    return displayCountries.map(country => {
      const coords = getCountryCoords(country);
      return {
        country,
        coords,
        position: latLngTo3D(coords.lat, coords.lng, 120),
      };
    });
  }, [displayCountries]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 40;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw globe outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        const y = centerY - (lat / 90) * radius;
        const latRadius = Math.cos((lat * Math.PI) / 180) * radius;
        
        // Only draw if visible (simplified)
        ctx.ellipse(centerX, y, latRadius, latRadius * 0.3 * Math.abs(Math.cos(rotation.x)), 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw longitude lines
      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath();
        const angle = ((lng + rotation.y * (180 / Math.PI)) * Math.PI) / 180;
        
        ctx.ellipse(
          centerX,
          centerY,
          radius * Math.abs(Math.sin(angle)),
          radius,
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Africa outline (simplified)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.5, 'rgba(240, 240, 240, 0.7)');
      gradient.addColorStop(1, 'rgba(200, 200, 200, 0.5)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sort country points by z-depth for proper rendering
      const sortedPoints = countryPoints
        .map(cp => {
          const rotated = rotatePoint(cp.position, rotation.x, rotation.y);
          return { ...cp, rotated, visible: rotated.z > -20 };
        })
        .filter(cp => cp.visible)
        .sort((a, b) => a.rotated.z - b.rotated.z);

      // Draw country points
      sortedPoints.forEach(({ country, rotated }) => {
        const screenX = centerX + rotated.x;
        const screenY = centerY - rotated.y;
        
        // Size based on depth
        const depthFactor = (rotated.z + radius) / (radius * 2);
        const pointSize = 4 + depthFactor * 8;
        const opacity = 0.4 + depthFactor * 0.6;

        const isHovered = hoveredCountry?.id === country.id;
        const isSelected = selectedCountry?.id === country.id;

        // Draw glow for hovered/selected
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, pointSize + 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.2})`;
          ctx.fill();
        }

        // Draw point
        ctx.beginPath();
        ctx.arc(screenX, screenY, pointSize, 0, Math.PI * 2);
        ctx.fillStyle = isHovered || isSelected 
          ? `rgba(0, 0, 0, ${opacity})` 
          : `rgba(50, 50, 50, ${opacity * 0.8})`;
        ctx.fill();

        // Draw country code label for visible points
        if (depthFactor > 0.5) {
          ctx.font = `${isHovered ? 'bold ' : ''}${10 + depthFactor * 4}px system-ui`;
          ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
          ctx.textAlign = 'center';
          ctx.fillText(country.code, screenX, screenY - pointSize - 6);
        }
      });

      // Draw title
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.textAlign = 'center';
      ctx.fillText('AFRICA', centerX, height - 20);
    };

    const animate = () => {
      if (autoRotateRef.current && !isDragging) {
        setRotation(prev => ({
          ...prev,
          y: prev.y + 0.003,
        }));
      }
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotation, countryPoints, hoveredCountry, selectedCountry, isDragging]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    autoRotateRef.current = false;
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 40;

    if (isDragging) {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;
      setRotation(prev => ({
        x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev.x - deltaY * 0.005)),
        y: prev.y + deltaX * 0.005,
      }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    } else {
      // Check for hover on country points
      let found: Country | null = null;
      
      countryPoints.forEach(cp => {
        const rotated = rotatePoint(cp.position, rotation.x, rotation.y);
        if (rotated.z < -20) return;
        
        const screenX = centerX + rotated.x;
        const screenY = centerY - rotated.y;
        const dist = Math.sqrt((x - screenX) ** 2 + (y - screenY) ** 2);
        
        if (dist < 15) {
          found = cp.country;
        }
      });
      
      setHoveredCountry(found);
      canvas.style.cursor = found ? 'pointer' : 'grab';
    }
  };

  const handleMouseUp = () => {
    if (isDragging && hoveredCountry) {
      onCountryClick(hoveredCountry);
    }
    setIsDragging(false);
    // Resume auto-rotation after 3 seconds
    setTimeout(() => {
      autoRotateRef.current = true;
    }, 3000);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredCountry(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hoveredCountry) {
      onCountryClick(hoveredCountry);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="mx-auto cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      
      {/* Hover tooltip */}
      {hoveredCountry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
        >
          Click to explore {hoveredCountry.name}
        </motion.div>
      )}

      {/* Instructions */}
      <p className="text-center text-xs text-gray-400 mt-2">
        Drag to rotate • Click a country to explore
      </p>
    </motion.div>
  );
};
