import { useEffect, useState } from "react";

interface AnalogTimerProps {
  remainingSeconds: number;
  totalSeconds?: number;
  size?: number;
}

export function AnalogTimer({ remainingSeconds, totalSeconds = 600, size = 48 }: AnalogTimerProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Calculate rotation based on remaining time
    // Full circle (360deg) represents the total time
    const progress = remainingSeconds / totalSeconds;
    const degrees = progress * 360;
    setRotation(degrees);
  }, [remainingSeconds, totalSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Calculate hand rotations
  const minuteHandRotation = ((totalSeconds - remainingSeconds) / totalSeconds) * 360;
  const secondHandRotation = ((remainingSeconds % 60) / 60) * 360;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Outer circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeDasharray={`${(rotation / 360) * 283} 283`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />

        {/* Clock marks (12 positions) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x1 = 50 + 38 * Math.cos(angle);
          const y1 = 50 + 38 * Math.sin(angle);
          const x2 = 50 + 42 * Math.cos(angle);
          const y2 = 50 + 42 * Math.sin(angle);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1.5"
              className="transform rotate-90"
              style={{ transformOrigin: '50px 50px' }}
            />
          );
        })}

        {/* Minute hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="25"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
          style={{
            transform: `rotate(${minuteHandRotation}deg)`,
            transformOrigin: '50px 50px'
          }}
        />

        {/* Center dot */}
        <circle
          cx="50"
          cy="50"
          r="3"
          fill="hsl(var(--foreground))"
        />
      </svg>
      
      {/* Digital time display in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-foreground bg-background/80 px-1.5 py-0.5 rounded">
          {timeDisplay}
        </span>
      </div>
    </div>
  );
}