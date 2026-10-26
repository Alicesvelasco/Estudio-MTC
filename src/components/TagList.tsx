export function TagList({ tags, className = '' }: { tags: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <li key={tag} className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs text-stone-600 ring-1 ring-stone-200">
          {tag}
        </li>
      ))}
    </ul>
  )
}
