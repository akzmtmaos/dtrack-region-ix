import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Pagination from '../components/Pagination'
import Input from '../components/Input'
import Table from '../components/Table'
import DocumentDetailModal from '../components/outbox/DocumentDetailModal'
import { apiService } from '../services/api'

/** API row from GET /inbox/ */
interface InboxApiRow {
  id: number | string
  inboxType: 'destination' | 'originating'
  destination: Record<string, unknown> | null
  document: Record<string, unknown>
}

interface DocumentView {
  id: number
  documentControlNo: string
  routeNo: string
  subject: string
  documentType: string
  sourceType: string
  internalOriginatingOffice: string
  internalOriginatingEmployee: string
  externalOriginatingOffice: string
  externalOriginatingEmployee: string
  noOfPages: string
  attachedDocumentFilename: string
  attachmentList: string
  userid: string
  currentCustodian?: string
  inSequence: string
  remarks: string
}

function docToView(d: Record<string, unknown>): DocumentView {
  return {
    id: Number(d.id),
    documentControlNo: String(d.documentControlNo ?? ''),
    routeNo: String(d.routeNo ?? ''),
    subject: String(d.subject ?? ''),
    documentType: String(d.documentType ?? ''),
    sourceType: String(d.sourceType ?? ''),
    internalOriginatingOffice: String(d.internalOriginatingOffice ?? ''),
    internalOriginatingEmployee: String(d.internalOriginatingEmployee ?? ''),
    externalOriginatingOffice: String(d.externalOriginatingOffice ?? ''),
    externalOriginatingEmployee: String(d.externalOriginatingEmployee ?? ''),
    noOfPages: String(d.noOfPages ?? ''),
    attachedDocumentFilename: String(d.attachedDocumentFilename ?? ''),
    attachmentList: String(d.attachmentList ?? ''),
    userid: String(d.userid ?? ''),
    currentCustodian: String(d.currentCustodian ?? ''),
    inSequence: String(d.inSequence ?? ''),
    remarks: String(d.remarks ?? ''),
  }
}

const ITEMS_PER_PAGE = 10

const Inbox: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [rows, setRows] = useState<InboxApiRow[]>([])
  const [receivingId, setReceivingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [detailDoc, setDetailDoc] = useState<DocumentView | null>(null)

  const employeeCode = (user?.employeeCode ?? '').trim()

  const loadInbox = useCallback(async () => {
    if (!employeeCode) {
      setRows([])
      setLoading(false)
      setError('Your account has no employee code. Inbox cannot be loaded.')
      return
    }
    setLoading(true)
    setError(null)
    const res = await apiService.getInboxDocuments(employeeCode)
    if (!res.success || !Array.isArray(res.data)) {
      setRows([])
      setError(res.error || 'Could not load Inbox')
      setLoading(false)
      return
    }
    setRows(res.data as InboxApiRow[])
    setLoading(false)
  }, [employeeCode])

  useEffect(() => {
    loadInbox()
  }, [loadInbox])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const doc = r.document || {}
      const dest = r.destination || {}
      const hay = [
        doc.documentControlNo,
        doc.routeNo,
        doc.subject,
        doc.documentType,
        dest.routeNo,
        dest.actionRequired,
        dest.destinationOffice,
      ]
        .map((x) => String(x ?? '').toLowerCase())
        .join(' ')
      return hay.includes(q)
    })
  }, [rows, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1)
  const page = Math.min(currentPage, totalPages)
  const pageRows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, rows.length])

  const formatReceived = (r: InboxApiRow) => {
    const dest = r.destination
    if (!dest) return '—'
    const dr = String(dest.dateReceived ?? '').trim()
    const tr = String(dest.timeReceived ?? '').trim()
    if (!dr && !tr) return '—'
    return [dr, tr].filter(Boolean).join(' ')
  }

  const handleRecordReceipt = async (destinationId: number) => {
    if (!employeeCode) {
      showError('Your account needs an employee code to record receipt.')
      return
    }
    const now = new Date()
    const ymd = now.toISOString().slice(0, 10)
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    const timeReceived = `${hh}:${mm}:${ss}`
    setReceivingId(destinationId)
    const res = await apiService.updateDocumentDestination(destinationId, {
      dateReceived: ymd,
      timeReceived,
      employeeActionOfficer: employeeCode,
    })
    setReceivingId(null)
    if (!res.success) {
      showError(res.error || 'Could not record receipt')
      return
    }
    showSuccess('Receipt recorded. This document is now in your Outbox (you hold it until the next routing step).')
    await loadInbox()
  }

  return (
    <div className="pt-4 pb-8">
      <h1 className={`text-2xl font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>Inbox</h1>
      <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        Documents routed to you as action officer, or where you are listed as internal/external originating employee.
      </p>

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
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48"
            icon={
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            iconPosition="left"
          />
        </div>
      </div>

      <hr
        className={`mb-4 mt-3 ${theme === 'dark' ? '' : 'border-gray-300'}`}
        style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
      />

      {error && (
        <div
          className={`mb-4 px-4 py-3 rounded-md text-sm ${
            theme === 'dark' ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-800'
          }`}
        >
          {error}
        </div>
      )}

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
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Document Control No.
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Route No.
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Subject
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Document Type
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Received
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Action Required
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Option
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            theme === 'dark' ? 'bg-dark-panel divide-dark-hover' : 'bg-white divide-gray-200'
          }`}>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className={`px-6 py-8 text-center text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-500'
                }`}>
                  No documents found
                </td>
              </tr>
            ) : (
              pageRows.map((r) => {
                const doc = r.document || {}
                const dest = r.destination
                const controlNo = String(doc.documentControlNo ?? '')
                const routeNo = dest
                  ? String(dest.routeNo ?? '')
                  : String(doc.routeNo ?? '')
                const subject = String(doc.subject ?? '')
                const docType = String(doc.documentType ?? '')
                const actionReq = dest ? String(dest.actionRequired ?? '') : '—'
                return (
                  <tr
                    key={String(r.id)}
                    className={`transition-colors ${
                      theme === 'dark' ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {controlNo}
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {routeNo || '—'}
                    </td>
                    <td className={`px-6 py-4 text-sm max-w-xs truncate ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`} title={subject}>
                      {subject}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {docType}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {formatReceived(r)}
                    </td>
                    <td className={`px-6 py-4 text-sm max-w-[12rem] truncate ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`} title={actionReq}>
                      {actionReq}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {r.inboxType === 'destination' &&
                          dest &&
                          !String(dest.dateReceived ?? '').trim() && (
                            <button
                              type="button"
                              disabled={receivingId === Number(dest.id)}
                              className={`text-xs font-medium px-2 py-1 rounded-md disabled:opacity-50 ${
                                theme === 'dark'
                                  ? 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900/80'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                              title="Mark this route step as received — document moves to your Outbox"
                              onClick={() => handleRecordReceipt(Number(dest.id))}
                            >
                              {receivingId === Number(dest.id) ? 'Saving…' : 'Record receipt'}
                            </button>
                          )}
                        <button
                          type="button"
                          className={`transition-colors ${
                            theme === 'dark'
                              ? 'text-green-400 hover:text-green-300'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title="View"
                          onClick={() => setDetailDoc(docToView(doc as Record<string, unknown>))}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Table>
      )}

      <DocumentDetailModal
        isOpen={!!detailDoc}
        onClose={() => setDetailDoc(null)}
        document={detailDoc}
      />
    </div>
  )
}

export default Inbox
