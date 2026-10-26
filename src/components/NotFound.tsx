import { ButtonLink } from './Button'

export function NotFound({ message = 'Esta página no existe.' }: { message?: string }) {
  return (
    <div className="py-16 text-center">
      <p className="mb-6 text-stone-600">{message}</p>
      <ButtonLink to="/">Volver a los tests</ButtonLink>
    </div>
  )
}
