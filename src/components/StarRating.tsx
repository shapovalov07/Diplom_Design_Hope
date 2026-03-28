import { clampRating, MAX_RATING } from '@/src/lib/rating'

type StarRatingProps = {
  value: number
  className?: string
  starClassName?: string
  activeClassName?: string
  inactiveClassName?: string
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={['block h-full w-full', className].filter(Boolean).join(' ')}
    >
      <path d="M12 2.5l2.93 5.94 6.55.95-4.74 4.62 1.12 6.52L12 17.45l-5.86 3.08 1.12-6.52L2.52 9.39l6.55-.95L12 2.5z" />
    </svg>
  )
}

export default function StarRating({
  value,
  className,
  starClassName = 'h-6 w-6',
  activeClassName = 'text-yellow-400',
  inactiveClassName = 'text-yellow-400/25',
}: StarRatingProps) {
  const safeValue = clampRating(value)

  return (
    <div className={['flex items-center gap-1', className].filter(Boolean).join(' ')} aria-hidden="true">
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const fillPercent = Math.max(0, Math.min(1, safeValue - index)) * 100

        return (
          <span key={index} className={['relative inline-block shrink-0', starClassName].filter(Boolean).join(' ')}>
            <StarIcon className={inactiveClassName} />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <StarIcon className={activeClassName} />
            </span>
          </span>
        )
      })}
    </div>
  )
}
