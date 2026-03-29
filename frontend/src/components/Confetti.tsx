import React, { useEffect, useState } from 'react';
import './Confetti.css';

interface ConfettiProps {
  duration?: number;
  onComplete?: () => void;
  isActive: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ duration = 3000, onComplete, isActive }) => {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate 60 pieces
      setPieces(Array.from({ length: 60 }).map((_, i) => i));
      
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div className="confetti-container">
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 2 + 2; // 2s to 4s
        const animationDelay = Math.random() * 0.5; // Small delay
        // Lotte/Cinematic color palette
        const colors = ['#e50914', '#ffd700', '#f48024', '#28a745', '#17a2b8', '#8b7355', '#c2b280'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const isCircle = Math.random() > 0.5;
        
        const style: React.CSSProperties = {
          left: `${left}%`,
          animationDuration: `${animationDuration}s`,
          animationDelay: `${animationDelay}s`,
          backgroundColor: color,
          borderRadius: isCircle ? '50%' : '0',
          width: isCircle ? '8px' : '10px',
          height: isCircle ? '8px' : '18px',
        };
        
        return <div key={i} className="confetti-piece" style={style} />;
      })}
    </div>
  );
};

export default Confetti;
