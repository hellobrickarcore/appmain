import React from 'react';

interface BrandedTextProps {
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Component that styles "HelloBrick" text with logo fonts
 * Automatically detects "HelloBrick" in text and applies branding
 */
export const BrandedText: React.FC<BrandedTextProps> = ({ 
  text, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Split text to find "HelloBrick" (case-insensitive)
  const parts = text.split(/(HelloBrick)/i);
  
  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {parts.map((part, index) => {
        if (part.toLowerCase() === 'hellobrick') {
          return (
            <span key={index} className="inline-flex items-baseline leading-none">
              <span 
                className="font-bold tracking-tight"
                style={{ 
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '-0.03em'
                }}
              >
                Hello
              </span>
              <span 
                className="font-bold text-[#F97316] ml-[1px]"
                style={{ 
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '-0.08em'
                }}
              >
                Brick
              </span>
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

/**
 * Helper function to render HelloBrick with logo styling
 * Use this for larger/prominent text
 */
export const renderHelloBrick = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md', className: string = '') => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base', 
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <span className={`inline-flex items-baseline leading-none ${sizeClasses[size]} ${className}`}>
      <span 
        className="font-bold tracking-tight"
        style={{ 
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '-0.03em'
        }}
      >
        Hello
      </span>
      <span 
        className="font-bold text-[#F97316] ml-[1px]"
        style={{ 
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '-0.08em'
        }}
      >
        Brick
      </span>
    </span>
  );
};




