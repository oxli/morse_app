interface MorseDisplayProps {
  morse: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MorseDisplay = ({ morse, showLabel = true, size = 'lg' }: MorseDisplayProps) => {
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
        {morse.split('').map((char, index) => (
          char === '.' ? (
            <div key={index} className={`${dotSizes[size]} rounded-full bg-slate-300`} />
          ) : (
            <div key={index} className={`${dashSizes[size]} rounded-sm bg-slate-300`} />
          )
        ))}
      </div>
      {showLabel && (
        <p className="text-slate-400 text-sm font-mono">
          {morse.split('').map(c => c === '.' ? 'dit' : 'dah').join(' ')}
        </p>
      )}
    </div>
  );
};
