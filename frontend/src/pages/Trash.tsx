import React, { useCallback, useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Button from '../components/Button'
import { TRASH_RETENTION_DAYS, formatDaysLeftLabel } from '../constants/trash'

interface TrashDocument {
  id: number
  documentControlNo: string
  routeNo: string
  subject: string
  documentType: string
  sourceType: string
  deletedAt?: string
}

function DaysLeftCell({
  deletedAt,
  textPrimary,
  textSecondary,
  theme,
}: {
  deletedAt?: string
  textPrimary: string
  textSecondary: string
  theme: string
}) {
  const label = formatDaysLeftLabel(deletedAt)
  if (label === '—') {
    return <span style={{ color: textSecondary }}>—</span>
  }
  const expired = label === 'Expired'
  const urgent = expired || label === 'Today' || label === '1 day'
  return (
    <span
      style={{
        color: expired ? (theme === 'dark' ? '#f87171' : '#dc2626') : urgent ? (theme === 'dark' ? '#fbbf24' : '#b45309') : textPrimary,
        fontWeight: urgent || expired ? 600 : 400,
      }}
    >
      {label}
    </span>
  )
}

const Trash: React.FC = () => {
  const { theme } = useTheme()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<TrashDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [busy, setBusy] = useState(false)

  const level = (user?.userLevel ?? '').toLowerCase()
  const isEndUser = level === 'end-user' || level === 'end-users'
  const employeeCode = isEndUser ? (user?.employeeCode ?? '') : undefined

  const fetchTrash = useCallback(() => {
    setLoading(true)
    setError(null)
    apiService.getDocumentSourceTrash(employeeCode).then((res) => {
      if (!res.success || !Array.isArray(res.data)) {
        setItems([])
        setError(res.error || 'Failed to load Trash')
        return
      }
      setItems(res.data as TrashDocument[])
    }).catch(() => {
      setItems([])
      const msg = 'Failed to load Trash'
      setError(msg)
      showError(msg)
    }).finally(() => setLoading(false))
  }, [employeeCode])

  useEffect(() => {
    fetchTrash()
  }, [fetchTrash])

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))
  const pageItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelected(pageItems.map((d) => d.id))
    else setSelected([])
  }

  const toggleOne = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const formatDeleted = (s?: string) => {
    if (!s) return '—'
    try {
      const d = new Date(s)
      return Number.isNaN(d.getTime()) ? s : d.toLocaleString()
    } catch {
      return s
    }
  }

  const handleRestore = async (id: number) => {
    setBusy(true)
    const res = await apiService.restoreDocumentSource(id, employeeCode)
    setBusy(false)
    if (res.success) {
      setItems((prev) => prev.filter((d) => d.id !== id))
      setSelected((prev) => prev.filter((x) => x !== id))
    } else {
      setError(res.error || 'Restore failed')
    }
  }

  const handleBulkRestore = async () => {
    if (selected.length === 0) return
    if (!window.confirm(`Restore ${selected.length}?`)) return
    setBusy(true)
    const res = await apiService.bulkRestoreDocumentSource(selected, employeeCode)
    setBusy(false)
    if (res.success) {
      showSuccess(`${selected.length} document(s) restored to Outbox`)
      setSelected([])
      fetchTrash()
    } else {
      const msg = res.error || 'Restore failed'
      setError(msg)
      showError(msg)
    }
  }

  const textPrimary = theme === 'dark' ? '#e5e7eb' : '#111827'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280'

  return (
    <div className="pt-4 pb-8">
      <h1
        className={`text-2xl font-semibold mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}
      >
        Trash
      </h1>
      <p className="text-xs mb-4" style={{ color: textSecondary }}>
        Each item is permanently removed {TRASH_RETENTION_DAYS} days after it was moved to Trash (see{' '}
        <span className="font-medium" style={{ color: textPrimary }}>Days left</span>).
      </p>

      {error && (
        <div className="mb-4 text-sm px-3 py-2 rounded-md border border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400">
          {error}
          <button type="button" className="ml-2 underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={items.length}
            itemsPerPage={itemsPerPage}
            showResultsText={false}
            compact={true}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={selected.length === 0 || busy}
            onClick={handleBulkRestore}
          >
            Restore{selected.length > 0 ? ` (${selected.length})` : ''}
          </Button>
        </div>
      </div>

      <hr
        className={`mb-4 mt-3 ${theme === 'dark' ? '' : 'border-gray-300'}`}
        style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
      />

      <Table
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={items.length}
            itemsPerPage={itemsPerPage}
          />
        }
      >
        <thead className={theme === 'dark' ? 'bg-dark-hover/60' : 'bg-gray-50'}>
          <tr>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <input
                type="checkbox"
                checked={pageItems.length > 0 && pageItems.every((d) => selected.includes(d.id))}
                onChange={toggleAll}
                className="rounded"
              />
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Document Control No.</th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Subject</th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Type</th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Deleted</th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Days left</th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${theme === 'dark' ? 'bg-dark-panel divide-dark-hover' : 'bg-white divide-gray-200'}`}>
          {loading ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: textSecondary }}>Loading…</td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: textSecondary }}>
                Trash is empty.
              </td>
            </tr>
          ) : (
            pageItems.map((doc) => (
              <tr key={doc.id} className={theme === 'dark' ? 'hover:bg-dark-hover/50' : 'hover:bg-gray-50'}>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(doc.id)}
                    onChange={() => toggleOne(doc.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-2 text-xs font-medium whitespace-nowrap" style={{ color: textPrimary }}>
                  {doc.documentControlNo || '—'}
                </td>
                <td className="px-4 py-2 text-xs max-w-xs truncate" style={{ color: textPrimary }} title={doc.subject}>
                  {doc.subject || '—'}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap" style={{ color: textSecondary }}>
                  {doc.documentType || '—'}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap" style={{ color: textSecondary }}>
                  {formatDeleted(doc.deletedAt)}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap tabular-nums" title={`Auto-removed after ${TRASH_RETENTION_DAYS} days in Trash`}>
                  <DaysLeftCell deletedAt={doc.deletedAt} textPrimary={textPrimary} textSecondary={textSecondary} theme={theme} />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRestore(doc.id)}
                    title="Restore"
                    aria-label="Restore"
                    className="inline-flex items-center justify-center p-1.5 rounded-md bg-[#3ecf8e] text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  )
}

export default Trash
