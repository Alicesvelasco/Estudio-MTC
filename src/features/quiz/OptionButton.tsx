import { Markdown } from '../../components/Markdown'

export type OptionState = 'idle' | 'correct' | 'wrong' | 'dimmed'

interface Props {
  label: string
  text: string
  state: OptionState
  disabled: boolean
  onSelect: () => void
}

const styles: Record<OptionState, { button: string; badge: string }> = {
  idle: {
    button: 'border-stone-300 bg-white hover:border-stone-500 hover:bg-stone-50',
    badge: 'border-stone-300 text-stone-500',
  },
  correct: {
    button: 'border-green-600 bg-green-50 text-green-900 ring-1 ring-green-600',
    badge: 'border-green-600 bg-green-600 text-white',
  },
  wrong: {
    button: 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-600',
    badge: 'border-red-600 bg-red-600 text-white',
  },
  dimmed: {
    button: 'border-stone-200 bg-white text-stone-400',
    badge: 'border-stone-200 text-stone-300',
  },
}

const icons: Partial<Record<OptionState, string>> = { correct: '✓', wrong: '✗' }

export function OptionButton({ label, text, state, disabled, onSelect }: Props) {
  const style = styles[state]
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 disabled:cursor-default ${style.button}`}
    >
      <span
        aria-hidden
        className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${style.badge}`}
      >
        {icons[state] ?? label}
      </span>
      <Markdown inline>{text}</Markdown>
      {state === 'correct' && <span className="sr-only">(respuesta correcta)</span>}
      {state === 'wrong' && <span className="sr-only">(tu respuesta, incorrecta)</span>}
    </button>
  )
}
