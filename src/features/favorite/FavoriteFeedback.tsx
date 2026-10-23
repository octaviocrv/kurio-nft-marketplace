import type { ApiError } from '@/api/error'

export function FavoriteFeedback({ error }: { error: ApiError | null }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {error.message}
    </p>
  )
}
