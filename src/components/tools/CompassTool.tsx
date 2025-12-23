import { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CompassTool: React.FC = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setHeading(360 - event.alpha);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    } else {
      setError('Device orientation not supported on this device');
    }
  }, []);

  const getDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getDirectionName = (degrees: number): string => {
    const names = [
      'North', 'North-East', 'East', 'South-East',
      'South', 'South-West', 'West', 'North-West'
    ];
    const index = Math.round(degrees / 45) % 8;
    return names[index];
  };

  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Compass Display */}
          <div className="relative w-64 h-64 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-black bg-white flex items-center justify-center">
              <Navigation
                className="w-32 h-32 text-red-600"
                style={{
                  transform: heading !== null ? `rotate(${heading}deg)` : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-out'
                }}
              />
            </div>
            
            {/* Direction Markers */}
            <div className="absolute inset-0">
              {['N', 'E', 'S', 'W'].map((dir, i) => (
                <div
                  key={dir}
                  className="absolute text-xl font-bold"
                  style={{
                    top: i === 0 ? '0' : i === 2 ? 'auto' : '50%',
                    bottom: i === 2 ? '0' : 'auto',
                    left: i === 3 ? '0' : i === 1 ? 'auto' : '50%',
                    right: i === 1 ? '0' : 'auto',
                    transform: (i === 0 || i === 2) ? 'translateX(-50%)' : 'translateY(-50%)',
                    padding: '8px'
                  }}
                >
                  {dir}
                </div>
              ))}
            </div>
          </div>

          {/* Heading Info */}
          {heading !== null && (
            <div className="space-y-2">
              <div className="text-6xl font-black text-black">
                {Math.round(heading)}°
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {getDirection(heading)}
              </div>
              <div className="text-lg text-gray-500">
                {getDirectionName(heading)}
              </div>
            </div>
          )}

          <Alert>
            <AlertDescription className="text-sm">
              For best results, hold your device flat and away from magnetic objects.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
};
