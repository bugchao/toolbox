import React from 'react'
import { Star } from 'lucide-react'

export type StarRatingProps = {
  stars: number // 0..3
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
}

const StarRating: React.FC<StarRatingProps> = ({ stars, size = 'md' }) => {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3].map((i) => {
        const active = i <= stars
        return (
          <Star
            key={i}
            className={[
              sizeMap[size],
              active
                ? 'fill-amber-400 text-amber-500'
                : 'text-gray-300 dark:text-gray-600',
            ].join(' ')}
            aria-hidden
          />
        )
      })}
    </div>
  )
}

export default StarRating
