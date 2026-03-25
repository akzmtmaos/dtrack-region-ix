import React, { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/Pagination'
import Input from '../../components/Input'
import Table from '../../components/Table'
import Button from '../../components/Button'
import { apiService } from '../../services/api'

type AuditEventType = string

interface AuditEventRow {
  id: number
  createdAt: string
  eventType: AuditEventType
  documentControlNo: string
  routeNo: string
  actorEmployeeCode: string
  details: string
}

function safeStr(v: unknown): string {
  return String(v ?? '').trim()
}

function formatEventLabel(eventType: string): string {
  const k = (eventType || '').toLowerCase()
  if (!k) return '—'
  if (k === 'document.created') return 'Created document'
  if (k === 'document.updated') return 'Updated document'
  if (k === 'document.deleted') return 'Deleted (moved to Trash)'
  if (k === 'document.restored') return 'Restored from Trash'
  if (k === 'document.permanently_deleted') return 'Permanently deleted'
  if (k === 'document.attachment_uploaded') return 'Uploaded attachment'
  if (k === 'routing.created') return 'Routed / forwarded'
  if (k === 'routing.updated') return 'Updated routing step'
  if (k === 'routing.received') return 'Received (routing)'
  if (k === 'routing.acted') return 'Action taken (routing)'
  if (k === 'routing.deleted') return 'Deleted routing step'
  return eventType
}

function formatIsoOrFallback(iso: unknown): string {
  const s = safeStr(iso)
  if (!s) return '—'
  const dt = new Date(s)
  if (Number.isNaN(dt.getTime())) return s
  return dt.toLocaleString()
}

function detailsFromMeta(meta: any): string {
  if (!meta || typeof meta !== 'object') return '—'

  const parts: string[] = []

  if (meta.subject) parts.push(`Subject: ${safeStr(meta.subject)}`)
  if (meta.documentType) parts.push(`Type: ${safeStr(meta.documentType)}`)
  if (meta.sourceType) parts.push(`Source: ${safeStr(meta.sourceType)}`)
  if (meta.destinationOffice) parts.push(`Office: ${safeStr(meta.destinationOffice)}`)
  if (meta.employeeActionOfficer) parts.push(`Officer: ${safeStr(meta.employeeActionOfficer)}`)
  if (meta.actionRequired) parts.push(`Required: ${safeStr(meta.actionRequired)}`)
  if (meta.actionTaken) parts.push(`Taken: ${safeStr(meta.actionTaken)}`)

  if (meta.filename) parts.push(`File: ${safeStr(meta.filename)}`)

  if (Array.isArray(meta.changedFields) && meta.changedFields.length > 0) {
    parts.push(`Changed: ${meta.changedFields.map((x: any) => safeStr(x)).join(', ')}`)
  }

  return parts.length ? parts.join(' • ') : '—'
}

const AuditTrail: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const ITEMS_PER_PAGE = 10

  const [rows, setRows] = useState<AuditEventRow[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const employeeCodeHeader = safeStr(user?.employeeCode)
  const isEndUser =
    safeStr(user?.userLevel).toLowerCase() === 'end-user' || safeStr(user?.userLevel).toLowerCase() === 'end-users'

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const res = await apiService.getAuditTrail(isEndUser ? employeeCodeHeader : undefined)
        const raw = res?.success && Array.isArray(res.data) ? res.data : []

        const mapped: AuditEventRow[] = raw.map((r: any) => ({
          id: Number(r.id),
          createdAt: formatIsoOrFallback(r.createdAt),
          eventType: safeStr(r.eventType),
          documentControlNo: safeStr(r.documentControlNo),
          routeNo: safeStr(r.routeNo),
          actorEmployeeCode: safeStr(r.actorEmployeeCode),
          details: detailsFromMeta(r.meta),
        }))

        setRows(mapped)
        setCurrentPage(1)
      } catch {
        setRows([])
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [user?.employeeCode, user?.userLevel])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return rows

    return rows.filter((r) => {
      const hay = [
        r.createdAt,
        r.eventType,
        formatEventLabel(r.eventType),
        r.documentControlNo,
        r.routeNo,
        r.actorEmployeeCode,
        r.details,
      ]
        .map((x) => safeStr(x).toLowerCase())
        .join(' ')

      return hay.includes(q)
    })
  }, [rows, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const page = Math.min(currentPage, totalPages)

  useEffect(() => {
    if (currentPage !== page) setCurrentPage(page)
  }, [currentPage, page])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const escapeHtml = (s: string) => (s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const printContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Audit Trail - Report</title>
    <style>
      @media print { @page { margin: 1cm; } }
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { text-align: center; margin-bottom: 18px; color: #333; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; vertical-align: top; }
      th { background-color: #f2f2f2; font-weight: bold; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .no-data { text-align: center; padding: 20px; color: #666; }
      .print-date { text-align: right; margin-bottom: 8px; color: #666; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="print-date">Printed on: ${new Date().toLocaleString()}</div>
    <h1>Audit Trail - Report</h1>
    <table>
      <thead>
        <tr>
          <th>Date/Time</th>
          <th>Event</th>
          <th>Document Control No.</th>
          <th>Route No.</th>
          <th>Actor</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${
          filtered.length === 0
            ? '<tr><td colspan="6" class="no-data">No rows found</td></tr>'
            : filtered
                .map(
                  (r) => `
          <tr>
            <td>${escapeHtml(r.createdAt)}</td>
            <td>${escapeHtml(formatEventLabel(r.eventType))}</td>
            <td>${escapeHtml(r.documentControlNo || '—')}</td>
            <td>${escapeHtml(r.routeNo || '—')}</td>
            <td>${escapeHtml(r.actorEmployeeCode || '—')}</td>
            <td>${escapeHtml(r.details || '—')}</td>
          </tr>
        `
                )
                .join('')
        }
      </tbody>
    </table>
  </body>
</html>`

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleExportToExcel = () => {
    const headers = ['Date/Time', 'Event', 'Document Control No.', 'Route No.', 'Actor', 'Details']
    const esc = (s: string) => `"${(s || '').replace(/"/g, '""')}"`

    const csvRows: string[] = [headers.join(',')]
    filtered.forEach((r) => {
      csvRows.push(
        [
          esc(r.createdAt),
          esc(formatEventLabel(r.eventType)),
          esc(r.documentControlNo),
          esc(r.routeNo),
          esc(r.actorEmployeeCode),
          esc(r.details),
        ].join(',')
      )
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `audit_trail_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportToWord = () => {
    const escapeHtml = (s: string) => (s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>Audit Trail - Report</title>
  </head>
  <body>
    <p>Exported on: ${new Date().toLocaleString()}</p>
    <h1>Audit Trail - Report</h1>
    <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th>Date/Time</th>
          <th>Event</th>
          <th>Document Control No.</th>
          <th>Route No.</th>
          <th>Actor</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${
          filtered.length === 0
            ? '<tr><td colspan="6">No rows found</td></tr>'
            : filtered
                .map(
                  (r) => `
        <tr>
          <td>${escapeHtml(r.createdAt)}</td>
          <td>${escapeHtml(formatEventLabel(r.eventType))}</td>
          <td>${escapeHtml(r.documentControlNo || '—')}</td>
          <td>${escapeHtml(r.routeNo || '—')}</td>
          <td>${escapeHtml(r.actorEmployeeCode || '—')}</td>
          <td>${escapeHtml(r.details || '—')}</td>
        </tr>
      `
                )
                .join('')
        }
      </tbody>
    </table>
  </body>
</html>`

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `audit_trail_${new Date().toISOString().split('T')[0]}.doc`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="pt-4 pb-8">
      <h1 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Audit Trail</h1>

      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div className="flex items-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            showResultsText={false}
            compact={true}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handlePrint} variant="secondary">Print</Button>
          <Button onClick={handleExportToExcel} variant="secondary">Excel</Button>
          <Button onClick={handleExportToWord} variant="secondary">Word</Button>

          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      <hr className={`mb-4 mt-3 ${theme === 'dark' ? '' : 'border-gray-300'}`} style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined} />

      {loading ? (
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading…</p>
      ) : (
        <Table
          pagination={
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          }
        >
          <thead className={theme === 'dark' ? 'bg-dark-hover/60' : 'bg-gray-50'}>
            <tr>
              <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Date/Time</th>
              <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Event</th>
              <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Document Control No.</th>
              <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Route No.</th>
              <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Actor</th>
              <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Details</th>
            </tr>
          </thead>
          <tbody className={theme === 'dark' ? 'divide-[#4a4b4c]' : 'divide-gray-200'}>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className={`px-4 py-12 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No audit events found.
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr key={r.id} className={theme === 'dark' ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{r.createdAt}</td>
                  <td className={`px-4 py-2 text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatEventLabel(r.eventType)}</td>
                  <td className={`px-4 py-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{r.documentControlNo || '—'}</td>
                  <td className={`px-4 py-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{r.routeNo || '—'}</td>
                  <td className={`px-4 py-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{r.actorEmployeeCode || '—'}</td>
                  <td className={`px-4 py-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="max-w-[520px] whitespace-pre-wrap break-words">{r.details}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  )
}

export default AuditTrail

