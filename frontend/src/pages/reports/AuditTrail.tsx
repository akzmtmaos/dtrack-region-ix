import React, { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/Pagination'
import Input from '../../components/Input'
import Table from '../../components/Table'
import Button from '../../components/Button'
import { apiService } from '../../services/api'

type AuditStatus = 'PENDING' | 'ACCOMPLISHED' | 'FAILED' | 'SENT'

interface AuditLogRow {
  id: number
  sequenceNo: number
  documentNumber: string
  subject: string
  recipient: string // "Receiver" column (originating employee)
  dateSent: string // kept for existing export/print compatibility
  documentType: string

  details: string
  destinationOfficer: string
  destinationOffice: string

  dateReleased: string
  timeReleased: string
  dateRequired: string
  timeRequired: string
  dateReceived: string
  timeReceived: string
  dateAccomplished: string
  timeAccomplished: string

  actionTaken: string
  actionTakenBy: string
  remarks: string

  status: AuditStatus
  priority: string
}

const AuditTrail: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const ITEMS_PER_PAGE = 10

  const [documents, setDocuments] = useState<AuditLogRow[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return documents
    return documents.filter((d) => {
      const hay = [
        d.documentNumber,
        d.subject,
        d.recipient,
        d.documentType,
        d.details,
        d.destinationOfficer,
        d.destinationOffice,
        d.actionTaken,
        d.remarks,
        d.status,
      ]
        .map((x) => String(x ?? '').toLowerCase())
        .join(' ')
      return hay.includes(q)
    })
  }, [documents, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE))
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredDocuments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredDocuments, currentPage])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'SENT':
        case 'ACCOMPLISHED':
          return 'bg-green-500/20 text-green-400'
        case 'PENDING':
          return 'bg-yellow-500/20 text-yellow-400'
        case 'FAILED':
          return 'bg-red-500/20 text-red-400'
        default:
          return 'bg-gray-500/20 text-gray-400'
      }
    } else {
      switch (status) {
        case 'SENT':
        case 'ACCOMPLISHED':
          return 'bg-green-100 text-green-800'
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800'
        case 'FAILED':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const getPriorityColor = (priority: string) => {
    if (theme === 'dark') {
      switch (priority) {
        case 'High':
          return 'bg-red-500/20 text-red-400'
        case 'Medium':
          return 'bg-yellow-500/20 text-yellow-400'
        case 'Low':
          return 'bg-blue-500/20 text-blue-400'
        default:
          return 'bg-gray-500/20 text-gray-400'
      }
    } else {
      switch (priority) {
        case 'High':
          return 'bg-red-100 text-red-800'
        case 'Medium':
          return 'bg-yellow-100 text-yellow-800'
        case 'Low':
          return 'bg-blue-100 text-blue-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const t = (v: unknown): string => String(v ?? '').trim()
  const formatNonEmpty = (v: unknown): string => {
    const s = t(v)
    return s ? s : '—'
  }

  const deriveStatus = (dest: {
    dateReceived?: string
    dateActedUpon?: string
  }): AuditStatus => {
    if (t(dest.dateActedUpon)) return 'ACCOMPLISHED'
    if (t(dest.dateReceived)) return 'PENDING'
    return 'PENDING'
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const level = (user?.userLevel ?? '').toLowerCase()
        const isEndUser = level === 'end-user' || level === 'end-users'
        const employeeCode = isEndUser ? t(user?.employeeCode) : undefined

        const srcRes = await apiService.getDocumentSource(employeeCode)
        const sources = srcRes?.success && Array.isArray(srcRes.data) ? srcRes.data : []

        const settled = await Promise.allSettled(
          sources.map(async (src: any) => {
            const destRes = await apiService.getDocumentDestination(src.id)
            const destinations = destRes?.success && Array.isArray(destRes.data) ? destRes.data : []
            destinations.sort((a: any, b: any) => Number(a.sequenceNo ?? a.sequence_no ?? 0) - Number(b.sequenceNo ?? b.sequence_no ?? 0))

            const receiver = t(src.internalOriginatingEmployee) || t(src.externalOriginatingEmployee)
            const documentNumber = t(src.documentControlNo)
            const subject = t(src.subject)
            const documentType = t(src.documentType)
            const dateSent = t(src.createdAt)

            return destinations.map((d: any) => {
              const destinationOfficer = t(d.employeeActionOfficer)
              const destinationOffice = t(d.destinationOffice)
              const status = deriveStatus({
                dateReceived: d.dateReceived,
                dateActedUpon: d.dateActedUpon,
              })

              const details =
                t(d.actionRequired) ||
                t(d.actionTaken) ||
                t(d.remarks) ||
                t(d.remarksOnActionTaken) ||
                '—'

              const actionTaken = t(d.actionTaken)
              const actionTakenBy = status === 'ACCOMPLISHED' ? destinationOfficer : destinationOfficer
              const remarks = t(d.remarksOnActionTaken) || t(d.remarks)

              return {
                id: Number(d.id),
                sequenceNo: Number(d.sequenceNo ?? 0),
                documentNumber: documentNumber || '—',
                subject: subject || '—',
                recipient: receiver || '—',
                dateSent: dateSent || '—',
                documentType: documentType || '—',

                details,
                destinationOfficer: destinationOfficer || '—',
                destinationOffice: destinationOffice || '—',

                dateReleased: t(d.dateReleased) || '—',
                timeReleased: t(d.timeReleased) || '—',
                dateRequired: t(d.dateRequired) || '—',
                timeRequired: t(d.timeRequired) || '—',
                dateReceived: t(d.dateReceived) || '—',
                timeReceived: t(d.timeReceived) || '—',
                dateAccomplished: t(d.dateActedUpon) || '—',
                timeAccomplished: t(d.timeActedUpon) || '—',

                actionTaken: actionTaken || '—',
                actionTakenBy: actionTakenBy || '—',
                remarks: remarks || '—',

                status,
                priority: '—',
              }
            })
          })
        )

        const allRows = settled
          .filter((s): s is PromiseFulfilledResult<AuditLogRow[]> => s.status === 'fulfilled')
          .flat()

        // Sort newest first-ish: document number then sequence
        allRows.sort((a, b) => {
          const cn = a.documentNumber.localeCompare(b.documentNumber)
          if (cn !== 0) return cn
          return a.sequenceNo - b.sequenceNo
        })

        setDocuments(allRows)
        setCurrentPage(1)
      } catch {
        setDocuments([])
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [user?.employeeCode, user?.userLevel])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Audit Trail - Report</title>
          <style>
            @media print {
              @page { margin: 1cm; }
              body { font-family: Arial, sans-serif; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .no-data {
              text-align: center;
              padding: 20px;
              color: #666;
            }
            .print-date {
              text-align: right;
              margin-bottom: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="print-date">Printed on: ${new Date().toLocaleString()}</div>
          <h1>Audit Trail - Report</h1>
          <table>
            <thead>
              <tr>
                <th>Document Control No.</th>
                <th>Subject</th>
                <th>Details</th>
                <th>Doc. Type</th>
                <th>Receiver</th>
                <th>Destination Officer</th>
                <th>Destination Office</th>
                <th>Date Released</th>
                <th>Time Released</th>
                <th>Date Required</th>
                <th>Time Required</th>
                <th>Date Received</th>
                <th>Time Received</th>
                <th>Date Accomplished</th>
                <th>Time Accomplished</th>
                <th>Action Taken</th>
                <th>Action Taken By:</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${documents.length === 0
                ? '<tr><td colspan="19" class="no-data">No documents found</td></tr>'
                : documents.map(doc => `
                  <tr>
                    <td>${doc.documentNumber || '—'}</td>
                    <td>${doc.subject || '—'}</td>
                    <td>${doc.recipient || '—'}</td>
                    <td>${doc.dateSent || '—'}</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>${doc.status || '—'}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleExportToExcel = () => {
    // Create CSV content
    const headers = ['Document Control No.', 'Subject', 'Details', 'Doc. Type', 'Receiver', 'Destination Officer', 'Destination Office', 'Date Released', 'Time Released', 'Date Required', 'Time Required', 'Date Received', 'Time Received', 'Date Accomplished', 'Time Accomplished', 'Action Taken', 'Action Taken By:', 'Remarks', 'Status']
    const csvRows = [headers.join(',')]

    documents.forEach(doc => {
      const row = [
        `\"${(doc.documentNumber || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(doc.subject || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(doc.recipient || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(doc.dateSent || '').replace(/\"/g, '\"\"')}\"`,
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        '\"\"',
        `\"${(doc.status || '').replace(/\"/g, '\"\"')}\"`
      ]
      csvRows.push(row.join(','))
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
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Audit Trail - Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .no-data {
              text-align: center;
              padding: 20px;
              color: #666;
            }
            .export-date {
              text-align: right;
              margin-bottom: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="export-date">Exported on: ${new Date().toLocaleString()}</div>
          <h1>Audit Trail - Report</h1>
          <table>
            <thead>
              <tr>
                <th>Document Control No.</th>
                <th>Subject</th>
                <th>Details</th>
                <th>Doc. Type</th>
                <th>Receiver</th>
                <th>Destination Officer</th>
                <th>Destination Office</th>
                <th>Date Released</th>
                <th>Time Released</th>
                <th>Date Required</th>
                <th>Time Required</th>
                <th>Date Received</th>
                <th>Time Received</th>
                <th>Date Accomplished</th>
                <th>Time Accomplished</th>
                <th>Action Taken</th>
                <th>Action Taken By:</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${documents.length === 0
                ? '<tr><td colspan="19" class="no-data">No documents found</td></tr>'
                : documents.map(doc => `
                  <tr>
                    <td>${doc.documentNumber || '—'}</td>
                    <td>${doc.subject || '—'}</td>
                    <td>${doc.recipient || '—'}</td>
                    <td>${doc.dateSent || '—'}</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>${doc.status || '—'}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8;' })
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
      <h1 className={`text-2xl font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>Audit Trail</h1>
      
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
              totalItems={filteredDocuments.length}
            itemsPerPage={10}
            showResultsText={false}
            compact={true}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            variant="secondary"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            }
            iconPosition="left"
          >
            Print
          </Button>
          <Button
            onClick={handleExportToExcel}
            variant="secondary"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            iconPosition="left"
          >
            Excel
          </Button>
          <Button
            onClick={handleExportToWord}
            variant="secondary"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            iconPosition="left"
          >
            Word
          </Button>
          <Input
            type="text"
            placeholder="Search..."
            className="w-48"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
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
      
      <Table
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredDocuments.length}
            itemsPerPage={10}
          />
        }
      >
        <thead className={theme === 'dark' ? 'bg-dark-hover/50' : 'bg-gray-50/50'}>
          <tr>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Document Control No.
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Subject
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Details
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Doc. Type
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Receiver
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Destination Officer
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Destination Office
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Date Released
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Time Released
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Date Required
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Time Required
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Date Received
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Time Received
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Date Accomplished
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Time Accomplished
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Action Taken
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Action Taken By:
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Remarks
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Status
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${
          theme === 'dark' ? 'bg-dark-panel divide-dark-hover' : 'bg-white divide-gray-200'
        }`}>
          {loading ? (
            <tr>
              <td colSpan={20} className={`px-6 py-8 text-center text-sm ${
                theme === 'dark' ? 'text-white' : 'text-gray-500'
              }`}>
                Loading...
              </td>
            </tr>
          ) : filteredDocuments.length === 0 ? (
            <tr>
              <td colSpan={20} className={`px-6 py-8 text-center text-sm ${
                theme === 'dark' ? 'text-white' : 'text-gray-500'
              }`}>
                No documents found
              </td>
            </tr>
          ) : (
            paginatedDocuments.map((doc) => (
              <tr 
                key={doc.id} 
                className={`transition-colors ${
                  theme === 'dark' ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'
                }`}
              >
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.documentNumber}
                </td>
                <td className={`px-6 py-4 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.subject}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.details}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.documentType}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.recipient}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.destinationOfficer}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.destinationOffice}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.dateReleased}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.timeReleased}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.dateRequired}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.timeRequired}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.dateReceived}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.timeReceived}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.dateAccomplished}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.timeAccomplished}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.actionTaken}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.actionTakenBy}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.remarks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  )
}

export default AuditTrail