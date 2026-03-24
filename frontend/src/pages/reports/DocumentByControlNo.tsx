import React, { useMemo, useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Pagination from '../../components/Pagination'
import Input from '../../components/Input'
import Table from '../../components/Table'
import Button from '../../components/Button'
import { apiService } from '../../services/api'

interface Document {
  id: number | string
  documentNumber: string
  subject: string
  recipient: string
  dateSent: string
  status: string
  priority?: string
  documentType?: string
  remarks?: string
}

const DocumentByControlNo: React.FC = () => {
  const { theme } = useTheme()
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const ITEMS_PER_PAGE = 10

  const pageDocuments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return documents.slice(start, start + ITEMS_PER_PAGE)
  }, [documents, currentPage])

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      const res = await apiService.getDocumentSource()
      if (res.success && Array.isArray(res.data)) {
        const mapped: Document[] = (res.data as any[]).map((row: any) => ({
          id: row.id ?? '',
          documentNumber: row.documentControlNo ?? '',
          subject: row.subject ?? '',
          recipient: (row.internalOriginatingEmployee || row.externalOriginatingEmployee) ?? '',
          dateSent: (() => {
            const raw = row.createdAt
            if (!raw) return new Date().toLocaleDateString()
            const d = new Date(raw)
            return Number.isNaN(d.getTime()) ? new Date().toLocaleDateString() : d.toLocaleDateString()
          })(),
          status: (row.status && ['ACCOMPLISHED', 'PENDING'].includes((row.status as string).toUpperCase()))
            ? (row.status as string).toUpperCase()
            : 'PENDING',
          documentType: row.documentType ?? '',
          remarks: row.remarks ?? '',
        }))
        setDocuments(mapped)
        setTotalPages(Math.max(1, Math.ceil(mapped.length / 10)))
      } else {
        setDocuments([])
        setTotalPages(1)
      }
      setLoading(false)
    }
    fetchDocuments()
  }, [])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document By Control No. - Report</title>
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
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
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
          <h1>Document By Control No. - Report</h1>
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
                <th>Date Accomplished</th>
                <th>Time Accomplished</th>
                <th>Action Taken</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${documents.length === 0
                ? '<tr><td colspan="12" class="no-data">No documents found</td></tr>'
                : documents.map(doc => `
                  <tr>
                    <td>${doc.documentNumber || '—'}</td>
                    <td>${doc.subject || '—'}</td>
                    <td>${doc.recipient || '—'}</td>
                    <td>${doc.documentType || '—'}</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>${doc.dateSent || '—'}</td>
                    <td>—</td>
                    <td>—</td>
                    <td>${doc.remarks || '—'}</td>
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
    const headers = ['Document Control No.', 'Subject', 'Details', 'Doc. Type', 'Receiver', 'Destination Officer', 'Destination Office', 'Date Accomplished', 'Time Accomplished', 'Action Taken', 'Remarks', 'Status']
    const csvRows = [headers.join(',')]

    documents.forEach(doc => {
      const row = [
        `\"${(doc.documentNumber || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(doc.subject || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(doc.recipient || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(doc.documentType || '').replace(/\"/g, '\"\"')}\"`,
        '\"\"',
        '\"\"',
        '\"\"',
        `\"${(doc.dateSent || '').replace(/\"/g, '\"\"')}\"`,
        '\"\"',
        '\"\"',
        `\"${(doc.remarks || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(doc.status || '').replace(/\"/g, '\"\"')}\"`
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `document_by_control_no_${new Date().toISOString().split('T')[0]}.csv`)
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
          <title>Document By Control No. - Report</title>
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
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
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
          <h1>Document By Control No. - Report</h1>
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
                <th>Date Accomplished</th>
                <th>Time Accomplished</th>
                <th>Action Taken</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${documents.length === 0
                ? '<tr><td colspan="12" class="no-data">No documents found</td></tr>'
                : documents.map(doc => `
                  <tr>
                    <td>${doc.documentNumber || '—'}</td>
                    <td>${doc.subject || '—'}</td>
                    <td>${doc.recipient || '—'}</td>
                    <td>${doc.documentType || '—'}</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>${doc.dateSent || '—'}</td>
                    <td>—</td>
                    <td>—</td>
                    <td>${doc.remarks || '—'}</td>
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
    link.setAttribute('download', `document_by_control_no_${new Date().toISOString().split('T')[0]}.doc`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="pt-4 pb-8">
      <h1 className={`text-2xl font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>Document By Control No.</h1>
      
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={documents.length}
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
            totalItems={documents.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        }
      >
        <thead className={theme === 'dark' ? 'bg-dark-hover/50' : 'bg-gray-50/50'}>
          <tr>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Status
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Document Control No.
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Subject
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Details
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Doc. Type
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Receiver
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Destination Officer
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Destination Office
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Date Accomplished
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Time Accomplished
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Action Taken
            </th>
            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Remarks
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${
          theme === 'dark' ? 'bg-dark-panel divide-dark-hover' : 'bg-white divide-gray-200'
        }`}>
          {loading ? (
            <tr>
              <td colSpan={12} className={`px-4 py-2 text-center text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading...
              </td>
            </tr>
          ) : pageDocuments.length === 0 ? (
            <tr>
              <td colSpan={12} className={`px-4 py-2 text-center text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                No documents found
              </td>
            </tr>
          ) : (
            pageDocuments.map((doc) => (
              <tr
                key={doc.id}
                className={`transition-colors ${theme === 'dark' ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'}`}
              >
                <td className="px-4 py-2 whitespace-nowrap text-xs text-left">
                  <span
                    className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wide border
                    ${(doc.status ?? '').toUpperCase() === 'ACCOMPLISHED'
                      ? theme === 'dark'
                        ? 'bg-green-900/60 text-green-300 border-green-600/50'
                        : 'bg-green-100 text-green-700 border-green-500'
                      : theme === 'dark'
                        ? 'bg-amber-900/50 text-amber-200 border-amber-600/50'
                        : 'bg-amber-100 text-amber-800 border-amber-400'
                    }
                  `}
                    title={doc.status ? `Status: ${doc.status}` : undefined}
                  >
                    {(doc.status ?? 'PENDING').toUpperCase()}
                  </span>
                </td>
                <td
                  className={`px-4 py-2 text-xs whitespace-normal ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  title={doc.documentNumber || undefined}
                >
                  {doc.documentNumber || '—'}
                </td>
                <td
                  className={`px-4 py-2 text-xs min-w-[8rem] whitespace-normal ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  title={doc.subject || undefined}
                >
                  {doc.subject || '—'}
                </td>
                <td
                  className={`px-4 py-2 text-xs min-w-[8rem] whitespace-normal ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  title={doc.recipient || undefined}
                >
                  {doc.recipient || '—'}
                </td>
                <td
                  className={`px-4 py-2 text-xs min-w-[10rem] whitespace-normal ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  title={doc.documentType || undefined}
                >
                  {doc.documentType || '—'}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} title="Receiver">—</td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} title="Destination Officer">—</td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} title="Destination Office">—</td>
                <td
                  className={`px-4 py-2 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  title={doc.dateSent || undefined}
                >
                  {doc.dateSent || '—'}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} title="Time Accomplished">—</td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} title="Action Taken">—</td>
                <td
                  className={`px-4 py-2 text-xs min-w-[8rem] whitespace-normal ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  title={doc.remarks || undefined}
                >
                  {doc.remarks || '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  )
}

export default DocumentByControlNo