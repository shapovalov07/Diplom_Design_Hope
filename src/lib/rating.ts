export const MAX_RATING = 5
export const MIN_RATING = 0.5
export const RATING_STEP = 0.5

export function clampRating(value: number) {
  return Math.min(MAX_RATING, Math.max(0, value))
}

export function snapRatingToStep(value: number) {
  return Math.round(clampRating(value) / RATING_STEP) * RATING_STEP
}

export function isValidRating(value: number) {
  if (!Number.isFinite(value) || value < MIN_RATING || value > MAX_RATING) {
    return false
  }

  return Math.abs(value / RATING_STEP - Math.round(value / RATING_STEP)) < Number.EPSILON
}

export function formatRating(value: number) {
  if (!Number.isFinite(value)) {
    return '0'
  }

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value)
}
