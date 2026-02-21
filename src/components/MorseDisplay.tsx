import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface MorseDisplayProps {
  morse: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface MorseDisplayHandle {
  highlightElement: (index: number) => void;
  reset: () => void;
}

export const MorseDisplay = forwardRef<MorseDisplayHandle, MorseDisplayProps>(
  ({ morse, showLabel = true, size = 'lg' }, ref) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useImperativeHandle(ref, () => ({
      highlightElement: (index: number) => {
        setActiveIndex(index);
      },
      reset: () => {
        setActiveIndex(null);
      },
    }));

    useEffect(() => {
      if (activeIndex !== null) {
        const timer = setTimeout(() => setActiveIndex(null), 200);
        return () => clearTimeout(timer);
      }
    }, [activeIndex]);

    const sizeClasses = {
      sm: 'text-xl gap-2',
      md: 'text-3xl gap-3',
      lg: 'text-5xl gap-4',
    };

    const dotSizes = {
      sm: 'w-3 h-3',
      md: 'w-5 h-5',
      lg: 'w-8 h-8',
    };

    const dashSizes = {
      sm: 'w-8 h-3',
      md: 'w-12 h-5',
      lg: 'w-16 h-8',
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <div className={`flex items-center ${sizeClasses[size]}`}>
          {morse.split('').map((char, index) => {
            const isActive = activeIndex === index;
            const baseClasses = 'rounded-full transition-all duration-150';

            if (char === '.') {
              return (
                <div
                  key={index}
                  className={`
                    ${dotSizes[size]} ${baseClasses}
                    ${isActive
                      ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400/50'
                      : 'bg-slate-300'}
                  `}
                />
              );
            } else {
              return (
                <div
                  key={index}
                  className={`
                    ${dashSizes[size]} ${baseClasses} rounded-sm
                    ${isActive
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                      : 'bg-slate-300'}
                  `}
                />
              );
            }
          })}
        </div>
        {showLabel && (
          <p className="text-slate-400 text-sm font-mono">
            {morse.split('').map(c => c === '.' ? 'dit' : 'dah').join(' ')}
          </p>
        )}
      </div>
    );
  }
);

MorseDisplay.displayName = 'MorseDisplay';
