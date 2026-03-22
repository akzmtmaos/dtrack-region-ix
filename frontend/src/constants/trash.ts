/** Must match backend TRASH_RETENTION_DAYS / purge logic (default 30). */
export const TRASH_RETENTION_DAYS = 30

/** Full days remaining until auto permanent-delete (from deletedAt + retention). */
export function daysLeftUntilPermanentDelete(deletedAt?: string | null): number | null {
  if (deletedAt == null || String(deletedAt).trim() === '') return null
  const t = Date.parse(deletedAt)
  if (Number.isNaN(t)) return null
  const expiryMs = t + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000
  const diff = expiryMs - Date.now()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

/** Short label for the Days left column. */
export function formatDaysLeftLabel(deletedAt?: string | null): string {
  const d = daysLeftUntilPermanentDelete(deletedAt)
  if (d === null) return '—'
  if (d < 0) return 'Expired'
  if (d === 0) return 'Today'
  if (d === 1) return '1 day'
  return `${d} days`
}
