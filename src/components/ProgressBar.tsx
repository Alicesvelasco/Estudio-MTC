interface Props {
  /** 0–1 */
  value: number
  className?: string
  barClassName?: string
  label?: string
}

export function ProgressBar({ value, className = '', barClassName = 'bg-stone-800', label }: Props) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
      className={`h-2 overflow-hidden rounded-full bg-stone-200 ${className}`}
    >
      <div className={`h-full rounded-full transition-all duration-300 ${barClassName}`} style={{ width: `${percent}%` }} />
    </div>
  )
}
