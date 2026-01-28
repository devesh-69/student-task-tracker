import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '', showLabel = false }) => {
  // Determine color based on progress
  const getColor = (p: number) => {
    if (p < 30) return 'bg-red-500';
    if (p < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
            <span className="text-xs font-semibold text-muted-foreground">Progress</span>
            <span className="text-xs font-semibold text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColor(progress)}`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
};
