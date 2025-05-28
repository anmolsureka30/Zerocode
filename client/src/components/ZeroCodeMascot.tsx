// client/src/components/ZeroCodeMascot.tsx
import React from 'react';

interface ZeroCodeMascotProps {
  className?: string;
}

// ZeroCode Mascot Component using the provided PNG
export const ZeroCodeMascot: React.FC<ZeroCodeMascotProps> = ({ className = 'h-64' }) => {
  // Use the mascot PNG image
  return (
    <img
      src="/mascot.png" 
      alt="ZeroCode Mascot"
      className={`${className} animate-bounce-slow`}
    />
  );
};

export default ZeroCodeMascot;
