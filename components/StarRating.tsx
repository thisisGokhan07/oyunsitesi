'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = 'md' 
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= (hoveredRating || rating);
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoveredRating(value)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
            disabled={readonly}
            className={cn(
              'transition-colors',
              !readonly && 'cursor-pointer hover:scale-110',
              readonly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-gray-600 fill-none'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

