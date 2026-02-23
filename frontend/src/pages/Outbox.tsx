import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { apiService } from '../services/api'
import AddDocumentModal from '../components/outbox/AddDocumentModal'
import DocumentDetailModal from '../components/outbox/DocumentDetailModal'
import { type DocumentDestinationRow } from '../components/outbox/DocumentDestinationsModal'
import AddDestinationRowModal from '../components/outbox/AddDestinationRowModal'
import ActionButtons from '../components/outbox/ActionButtons'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import Pagination from '../components/Pagination'
import Button from '../components/Button'
import Input from '../components/Input'
import Table from '../components/Table'

interface Document {
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
  inSequence: string
  remarks: string
}

const Outbox: React.FC = () => {
  const { theme } = useTheme()
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [detailModalMode, setDetailModalMode] = useState<'view' | 'edit'>('view')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(1)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteItemName, setDeleteItemName] = useState<string>('')
  const [documentForDestinations, setDocumentForDestinations] = useState<Document | null>(null)
  const [destinationsByDocumentId, setDestinationsByDocumentId] = useState<Record<number, DocumentDestinationRow[]>>({})
  const [isAddDestinationRowModalOpen, setIsAddDestinationRowModalOpen] = useState(false)
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null)
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<number[]>([])
  const [destinationPage, setDestinationPage] = useState(1)
  const destinationPageSize = 10
  const [destinationSearch, setDestinationSearch] = useState('')
  const [isDeleteDestinationsModalOpen, setIsDeleteDestinationsModalOpen] = useState(false)
  const [pendingDestinationDeleteIds, setPendingDestinationDeleteIds] = useState<number[]>([])

  // Fetch documents from Supabase on mount and when refetch is needed
  const fetchDocuments = () => {
    apiService.getDocumentSource().then((res) => {
      if (!res) return
      const raw = res.success && res.data != null ? res.data : []
      const list = Array.isArray(raw) ? raw : []
      setDocuments(list)
    }).catch(() => setDocuments([]))
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  // When a document is selected for destinations (inline section), fetch its destinations
  useEffect(() => {
    if (!documentForDestinations) return
    setDestinationPage(1)
    setDestinationSearch('')
    apiService.getDocumentDestination(documentForDestinations.id).then((res) => {
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : []
        setDestinationsByDocumentId((prev) => ({ ...prev, [documentForDestinations.id]: list }))
      }
    })
  }, [documentForDestinations?.id])

  // Helper for red asterisk
  const RequiredAsterisk = () => <span className="text-red-500">*</span>;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(documents.map(doc => doc.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return
    setDeleteType('bulk')
    setIsDeleteModalOpen(true)
  }

  const confirmBulkDelete = () => {
    apiService.bulkDeleteDocumentSource(selectedItems).then((res) => {
      if (!res.success) return
      setDocuments((prev) => prev.filter((doc) => !selectedItems.includes(doc.id)))
      setSelectedItems([])
      setIsDeleteModalOpen(false)
    })
  }

  const handleAddDocument = (document: Partial<Document>, pendingFile?: File | null) => {
    apiService.createDocumentSource(document as Record<string, unknown>).then(async (res) => {
      if (!res.success || !res.data) return
      let newDocument = res.data as Document
      if (pendingFile) {
        const up = await apiService.uploadDocumentAttachment(newDocument.id, pendingFile)
        const path = up.data?.path
        const filename = up.data?.filename
        if (up.success && path && filename) {
          const updateRes = await apiService.updateDocumentSource(newDocument.id, {
            attachmentList: path,
            attachedDocumentFilename: filename,
          } as Record<string, unknown>)
          if (updateRes.success && updateRes.data) newDocument = updateRes.data as Document
        }
      }
      setDocuments((prev) => [...prev, newDocument])
      setDocumentForDestinations(newDocument)
      setDestinationsByDocumentId((prev) => ({ ...prev, [newDocument.id]: [] }))
      setIsAddModalOpen(false)
      setEditingDocument(null)
    })
  }

  const handleAddDestinationClick = (doc: Document) => {
    setDocumentForDestinations(doc)
    setSelectedDestinationIds([])
  }

  const handleAddDestinationRow = (doc: Document) => {
    setDocumentForDestinations(doc)
    setIsAddDestinationRowModalOpen(true)
  }

  const handleSaveDestinationRow = (row: Omit<DocumentDestinationRow, 'id'>) => {
    if (!documentForDestinations) return
    const payload = { documentSourceId: documentForDestinations.id, ...row }
    apiService.createDocumentDestination(payload as Record<string, unknown>).then((res) => {
      if (!res.success || !res.data) return
      const newRow = res.data as DocumentDestinationRow
      setDestinationsByDocumentId((prev) => ({
        ...prev,
        [documentForDestinations.id]: [...(prev[documentForDestinations.id] ?? []), newRow]
      }))
      setIsAddDestinationRowModalOpen(false)
    })
  }

  const handleDeleteDestinationRows = (ids: number[]) => {
    if (!documentForDestinations || ids.length === 0) return
    apiService.bulkDeleteDocumentDestination(ids).then((res) => {
      if (!res.success) return
      setSelectedDestinationIds([])
      apiService.getDocumentDestination(documentForDestinations.id).then((r) => {
        if (r.success && r.data)
          setDestinationsByDocumentId((prev) => ({ ...prev, [documentForDestinations.id]: r.data! }))
      })
    })
  }

  const handleRowClick = (document: Document) => {
    setSelectedDocument(document)
    setIsDetailModalOpen(true)
  }

  const handleUpdateDocument = (updatedDocument: Document, pendingFile?: File | null) => {
    const doUpdate = (payload: Record<string, unknown>) => {
      apiService.updateDocumentSource(updatedDocument.id, payload).then((res) => {
        if (!res.success || !res.data) return
        const doc = res.data as Document
        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)))
        setSelectedDocument(doc)
      })
    }
    if (pendingFile) {
      apiService.uploadDocumentAttachment(updatedDocument.id, pendingFile).then((up) => {
        const path = up.data?.path
        const filename = up.data?.filename
        if (up.success && path && filename) {
          doUpdate({
            ...(updatedDocument as unknown as Record<string, unknown>),
            attachmentList: path,
            attachedDocumentFilename: filename,
          })
        } else {
          doUpdate(updatedDocument as unknown as Record<string, unknown>)
        }
      })
    } else {
      doUpdate(updatedDocument as unknown as Record<string, unknown>)
    }
  }

  const handleDeleteDocument = (document: Document) => {
    setDeleteType('single')
    setDeleteId(document.id)
    setDeleteItemName(document.documentControlNo || document.subject || 'this document')
    setIsDeleteModalOpen(true)
  }

  const confirmSingleDelete = () => {
    if (!deleteId) return
    apiService.deleteDocumentSource(deleteId).then((res) => {
      if (!res.success) return
      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteId))
      if (selectedDocument?.id === deleteId) {
        setIsDetailModalOpen(false)
        setSelectedDocument(null)
      }
      setDeleteId(null)
      setDeleteItemName('')
      setIsDeleteModalOpen(false)
    })
  }

  const handleView = (document: Document) => {
    setSelectedDocument(document)
    setDetailModalMode('view')
    setIsDetailModalOpen(true)
  }

  const handleRoutingSlip = (doc: Document) => {
    apiService.getDocumentDestination(doc.id).then((res) => {
      const destinations = res.success && res.data ? res.data : (destinationsByDocumentId[doc.id] ?? [])
      try {
        localStorage.setItem('routingSlipDocument', JSON.stringify(doc))
        localStorage.setItem('routingSlipDestinations', JSON.stringify(destinations))
        window.open('/routing-slip', '_blank', 'noopener,noreferrer')
      } catch {
        window.open('/routing-slip', '_blank', 'noopener,noreferrer')
      }
    })
  }

  const handleEdit = (document: Document) => {
    setEditingDocument(document)
    setIsAddModalOpen(true)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Outbox - Document List</title>
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
          <h1>Outbox - Document List</h1>
          <table>
            <thead>
              <tr>
                <th>Document Control No.</th>
                <th>Route No.</th>
                <th>Subject</th>
                <th>Document Type</th>
                <th>Source Type</th>
              </tr>
            </thead>
            <tbody>
              ${documents.length === 0 
                ? '<tr><td colspan="5" class="no-data">No documents found</td></tr>'
                : documents.map(doc => `
                  <tr>
                    <td>${doc.documentControlNo || '—'}</td>
                    <td>${doc.routeNo || '—'}</td>
                    <td>${doc.subject || '—'}</td>
                    <td>${doc.documentType || '—'}</td>
                    <td>${doc.sourceType || '—'}</td>
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
    const headers = ['Document Control No.', 'Route No.', 'Subject', 'Document Type', 'Source Type']
    const csvRows = [headers.join(',')]

    documents.forEach(doc => {
      const row = [
        `"${(doc.documentControlNo || '').replace(/"/g, '""')}"`,
        `"${(doc.routeNo || '').replace(/"/g, '""')}"`,
        `"${(doc.subject || '').replace(/"/g, '""')}"`,
        `"${(doc.documentType || '').replace(/"/g, '""')}"`,
        `"${(doc.sourceType || '').replace(/"/g, '""')}"`
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `outbox_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportToWord = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Outbox - Document List</title>
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
              border: 1px solid #333;
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
          <h1>Outbox - Document List</h1>
          <table>
            <thead>
              <tr>
                <th>Document Control No.</th>
                <th>Route No.</th>
                <th>Subject</th>
                <th>Document Type</th>
                <th>Source Type</th>
              </tr>
            </thead>
            <tbody>
              ${documents.length === 0 
                ? '<tr><td colspan="5" class="no-data">No documents found</td></tr>'
                : documents.map(doc => `
                  <tr>
                    <td>${doc.documentControlNo || '—'}</td>
                    <td>${doc.routeNo || '—'}</td>
                    <td>${doc.subject || '—'}</td>
                    <td>${doc.documentType || '—'}</td>
                    <td>${doc.sourceType || '—'}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `outbox_${new Date().toISOString().split('T')[0]}.doc`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const valueBg = theme === 'dark' ? '#262626' : '#f5f5f5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'

  return (
    <div className="pt-4 pb-8">
      {!documentForDestinations ? (
        <>
        <h1 className={`text-2xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Outbox - Document Source</h1>
        
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
            <Button
              onClick={handleDeleteSelected}
              disabled={selectedItems.length === 0}
              variant="danger"
            >
              Delete {selectedItems.length > 0 && `(${selectedItems.length})`}
            </Button>
            <Button
              onClick={() => {
                setEditingDocument(null)
                setIsAddModalOpen(true)
              }}
              variant="primary"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
              iconPosition="left"
            >
              Add
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
            contentElevated={hoveredRowId !== null}
            pagination={
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={documents.length}
                itemsPerPage={10}
              />
            }
          >
            <thead className={theme === 'dark' ? 'bg-dark-hover/60' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={documents.length > 0 && selectedItems.length === documents.length}
                    onChange={handleSelectAll}
                    className={`rounded text-[#3BA55C] focus:ring-2 focus:ring-[#3BA55C] focus:ring-offset-0 ${
                      theme === 'dark' ? 'bg-dark-panel border-[#4a4b4c]' : 'border-gray-300 bg-white'
                    }`}
                    style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
                  />
                </th>
                <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Document Control No. <RequiredAsterisk />
                </th>
                <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Route No. <RequiredAsterisk />
                </th>
                <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Subject <RequiredAsterisk />
                </th>
                <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Document Type
                </th>
                <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Source Type
                </th>
                <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' ? 'bg-dark-panel divide-[#4a4b4c]' : 'bg-white divide-gray-200'
            }`}>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-4 py-12 text-center ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div className="flex flex-col items-center justify-center">
                      <svg 
                        className={`w-16 h-16 mb-4 ${
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-base font-medium mb-1">No documents found</p>
                      <p className="text-sm">Get started by adding your first document</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc, idx) => (
                  <tr 
                    key={doc?.id ?? doc?.documentControlNo ?? `row-${idx}`} 
                    className={`transition-all duration-150 cursor-pointer ${
                      theme === 'dark' 
                        ? 'hover:bg-dark-hover/50 active:bg-dark-hover' 
                        : 'hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    style={{ position: 'relative', zIndex: hoveredRowId === doc.id ? 10 : 0 }}
                    onMouseEnter={() => setHoveredRowId(doc.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    onClick={() => handleRowClick(doc)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(doc.id)}
                        onChange={() => handleSelectItem(doc.id)}
                        className={`rounded text-[#3BA55C] focus:ring-2 focus:ring-[#3BA55C] focus:ring-offset-0 transition-all ${
                          theme === 'dark' ? 'border-[#4a4b4c] bg-dark-panel' : 'border-gray-300 bg-white'
                        }`}
                      />
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-xs font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {doc.documentControlNo || <span className="text-gray-500 italic">—</span>}
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-xs ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {doc.routeNo || <span className="text-gray-500 italic">—</span>}
                    </td>
                    <td className={`px-4 py-2 text-xs max-w-xs ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <div className="truncate" title={doc.subject}>
                        {doc.subject || <span className="text-gray-500 italic">—</span>}
                      </div>
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-xs text-left ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {doc.documentType || <span className="text-gray-500 italic">—</span>}
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-xs ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {doc.sourceType || <span className="text-gray-500 italic">—</span>}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <ActionButtons
                        document={doc}
                        onView={handleView}
                        onRoutingSlip={handleRoutingSlip}
                        onEdit={handleEdit}
                        onAddDestination={handleAddDestinationClick}
                        onDelete={handleDeleteDocument}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </>
      ) : documentForDestinations ? (
        /* Inside document: document source summary + destinations table only */
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setDocumentForDestinations(null)
                setSelectedDestinationIds([])
              }}
              className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-md px-2.5 py-1.5 ${
                theme === 'dark' ? 'text-gray-400 hover:bg-dark-hover hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Outbox
            </button>
            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Document: {documentForDestinations.documentControlNo || '—'} — {documentForDestinations.subject || '—'}
            </h1>
          </div>

          {/* Document source (read-only summary) */}
          <div
            className={`rounded-lg border overflow-hidden ${
              theme === 'dark' ? 'bg-dark-panel border-[#4a4b4c]' : 'bg-white border-gray-200'
            }`}
          >
            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-[#4a4b4c]' : 'border-gray-200'}`}>
              <h2 className={`text-sm font-semibold ${theme === 'dark' ? 'text-[#3ecf8e]' : 'text-gray-800'}`}>
                Document Source
              </h2>
            </div>
            <div className="px-4 py-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>Document Control No.</label>
                <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.documentControlNo || '—'}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>Route No.</label>
                <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.routeNo || '—'}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>Subject</label>
                <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.subject || '—'}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>Document Type</label>
                <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.documentType || '—'}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>Source Type</label>
                <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.sourceType || '—'}</div>
              </div>
              {documentForDestinations.sourceType === 'Internal' && (
                <>
                  <div className="flex items-center gap-3">
                    <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>Internal Originating Office</label>
                    <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.internalOriginatingOffice || '—'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>Internal Originating Employee</label>
                    <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.internalOriginatingEmployee || '—'}</div>
                  </div>
                </>
              )}
              {documentForDestinations.sourceType === 'External' && (
                <>
                  <div className="flex items-center gap-3">
                    <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>External Originating Office</label>
                    <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.externalOriginatingOffice || '—'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>External Originating Employee</label>
                    <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.externalOriginatingEmployee || '—'}</div>
                  </div>
                </>
              )}
              <div className="flex items-center gap-3">
                <label className="font-medium whitespace-nowrap w-44" style={{ color: textSecondary }}>Remarks</label>
                <div className="flex-1 px-2.5 py-1.5 rounded-md min-h-[28px] flex items-center whitespace-pre-wrap" style={{ backgroundColor: valueBg, color: textPrimary }}>{documentForDestinations.remarks || '—'}</div>
              </div>
            </div>
          </div>

          {/* Document Destinations table */}
          <div
            className={`rounded-lg border overflow-hidden ${
              theme === 'dark' ? 'bg-dark-panel border-[#4a4b4c]' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`px-4 py-3 flex flex-wrap items-center gap-3 border-b ${
                theme === 'dark' ? 'border-[#4a4b4c]' : 'border-gray-200'
              }`}
            >
              <h2 className={`text-sm font-semibold ${theme === 'dark' ? 'text-[#3ecf8e]' : 'text-gray-800'}`}>
                Document Destination
              </h2>
              <Input
                type="text"
                placeholder="Search destinations..."
                value={destinationSearch}
                onChange={(e) => {
                  setDestinationSearch(e.target.value)
                  setDestinationPage(1)
                }}
                className="w-48"
                icon={
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                iconPosition="left"
              />
              <div className="flex items-center gap-2 ml-auto">
                {documentForDestinations && (() => {
                  const rawDests = destinationsByDocumentId[documentForDestinations.id] ?? []
                  const q = (destinationSearch || '').trim().toLowerCase()
                  const filteredDests = q ? rawDests.filter((d) =>
                    (d.routeNo || '').toLowerCase().includes(q) ||
                    (d.destinationOffice || '').toLowerCase().includes(q) ||
                    (d.employeeActionOfficer || '').toLowerCase().includes(q) ||
                    (d.actionRequired || '').toLowerCase().includes(q) ||
                    (d.remarks || '').toLowerCase().includes(q)
                  ) : rawDests
                  return filteredDests.length > 0 && (
                    <Pagination
                      currentPage={destinationPage}
                      totalPages={Math.max(1, Math.ceil(filteredDests.length / destinationPageSize))}
                      onPageChange={(p) => setDestinationPage(p)}
                      totalItems={filteredDests.length}
                      itemsPerPage={destinationPageSize}
                      showResultsText={false}
                      compact
                    />
                  )
                })()}
                <Button
                  onClick={() => handleAddDestinationRow(documentForDestinations)}
                  variant="primary"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                  iconPosition="left"
                >
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setPendingDestinationDeleteIds(selectedDestinationIds)
                    setIsDeleteDestinationsModalOpen(true)
                  }}
                  disabled={selectedDestinationIds.length === 0}
                  variant="danger"
                >
                  Delete Selected {selectedDestinationIds.length > 0 && `(${selectedDestinationIds.length})`}
                </Button>
              </div>
            </div>
            <Table>
              <thead className={theme === 'dark' ? 'bg-dark-hover/60' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={(() => {
                        const rawDests = documentForDestinations ? (destinationsByDocumentId[documentForDestinations.id] ?? []) : []
                        const q = (destinationSearch || '').trim().toLowerCase()
                        const filteredDests = q ? rawDests.filter((d) =>
                          (d.routeNo || '').toLowerCase().includes(q) ||
                          (d.destinationOffice || '').toLowerCase().includes(q) ||
                          (d.employeeActionOfficer || '').toLowerCase().includes(q) ||
                          (d.actionRequired || '').toLowerCase().includes(q) ||
                          (d.remarks || '').toLowerCase().includes(q)
                        ) : rawDests
                        const start = (destinationPage - 1) * destinationPageSize
                        const pageDests = filteredDests.slice(start, start + destinationPageSize)
                        return pageDests.length > 0 && pageDests.every((d) => selectedDestinationIds.includes(d.id))
                      })()}
                      onChange={(e) => {
                        const rawDests = documentForDestinations ? (destinationsByDocumentId[documentForDestinations.id] ?? []) : []
                        const q = (destinationSearch || '').trim().toLowerCase()
                        const filteredDests = q ? rawDests.filter((d) =>
                          (d.routeNo || '').toLowerCase().includes(q) ||
                          (d.destinationOffice || '').toLowerCase().includes(q) ||
                          (d.employeeActionOfficer || '').toLowerCase().includes(q) ||
                          (d.actionRequired || '').toLowerCase().includes(q) ||
                          (d.remarks || '').toLowerCase().includes(q)
                        ) : rawDests
                        const start = (destinationPage - 1) * destinationPageSize
                        const pageDests = filteredDests.slice(start, start + destinationPageSize)
                        if (e.target.checked) {
                          setSelectedDestinationIds((prev) => {
                            const add = pageDests.map((d) => d.id)
                            return [...new Set([...prev, ...add])]
                          })
                        } else {
                          const pageIds = new Set(pageDests.map((d) => d.id))
                          setSelectedDestinationIds((prev) => prev.filter((id) => !pageIds.has(id)))
                        }
                      }}
                      className={`rounded ${theme === 'dark' ? 'bg-dark-panel border-[#4a4b4c]' : 'border-gray-300'}`}
                    />
                  </th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Route No.</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Seq.</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Destination Office</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Employee (Action Officer)</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Action Required</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Date Released</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Time Released</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Date Required</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Time Required</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Remarks</th>
                </tr>
              </thead>
              <tbody className={theme === 'dark' ? 'divide-[#4a4b4c]' : 'divide-gray-200'}>
                {(() => {
                  const rawDests = documentForDestinations ? (destinationsByDocumentId[documentForDestinations.id] ?? []) : []
                  const q = (destinationSearch || '').trim().toLowerCase()
                  const filteredDests = q ? rawDests.filter((d) =>
                    (d.routeNo || '').toLowerCase().includes(q) ||
                    (d.destinationOffice || '').toLowerCase().includes(q) ||
                    (d.employeeActionOfficer || '').toLowerCase().includes(q) ||
                    (d.actionRequired || '').toLowerCase().includes(q) ||
                    (d.remarks || '').toLowerCase().includes(q)
                  ) : rawDests
                  const startIdx = (destinationPage - 1) * destinationPageSize
                  const paginatedDests = filteredDests.slice(startIdx, startIdx + destinationPageSize)
                  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '')
                  const formatTime = (t: string) => (t ? new Date(`1970-01-01T${t}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '')
                  if (filteredDests.length === 0) {
                    return (
                      <tr>
                        <td
                          colSpan={10}
                          className={`px-4 py-10 text-center text-sm min-h-[120px] align-middle ${
                            theme === 'dark' ? 'text-gray-400 bg-dark-panel' : 'text-gray-500 bg-gray-50'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <svg className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span>{q ? 'No destinations match your search.' : 'No destinations.'}</span>
                            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{q ? 'Try a different search.' : 'Click Add to add a destination.'}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                  return paginatedDests.map((dest) => (
                    <tr
                      key={dest.id}
                      className={theme === 'dark' ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedDestinationIds.includes(dest.id)}
                          onChange={() => {
                            setSelectedDestinationIds((prev) =>
                              prev.includes(dest.id) ? prev.filter((i) => i !== dest.id) : [...prev, dest.id]
                            )
                          }}
                          className={`rounded ${theme === 'dark' ? 'bg-dark-panel border-[#4a4b4c]' : 'border-gray-300'}`}
                        />
                      </td>
                        <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{dest.routeNo || '—'}</td>
                      <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{dest.sequenceNo}</td>
                      <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{dest.destinationOffice || '—'}</td>
                      <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{dest.employeeActionOfficer || '—'}</td>
                      <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{dest.actionRequired || '—'}</td>
                      <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{formatDate(dest.dateReleased)}</td>
                      <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{formatTime(dest.timeReleased)}</td>
                      <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{formatDate(dest.dateRequired)}</td>
                      <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{formatTime(dest.timeRequired)}</td>
                      <td className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{dest.remarks || '—'}</td>
                    </tr>
                  ))
                })()}
              </tbody>
            </Table>
          </div>
        </div>
      ) : null}

      {/* Add / Edit Document Modal */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingDocument(null)
        }}
        onAdd={handleAddDocument}
        editingDocument={editingDocument}
        onUpdate={handleUpdateDocument}
      />

      {/* Document Detail Modal */}
      <DocumentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedDocument(null)
          setDetailModalMode('view')
        }}
        document={selectedDocument}
        onUpdate={handleUpdateDocument}
        onEditRequest={(doc) => {
          setEditingDocument(doc)
          setIsDetailModalOpen(false)
          setSelectedDocument(null)
          setIsAddModalOpen(true)
        }}
        mode={detailModalMode}
      />

      {/* Add Destination Row Modal */}
      <AddDestinationRowModal
        isOpen={isAddDestinationRowModalOpen}
        onClose={() => setIsAddDestinationRowModalOpen(false)}
        onSave={handleSaveDestinationRow}
        document={documentForDestinations}
        nextSequenceNo={(documentForDestinations ? (destinationsByDocumentId[documentForDestinations.id] ?? []) : []).length + 1}
      />

      {/* Delete Confirmation Modal (documents) */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteId(null)
          setDeleteItemName('')
        }}
        onConfirm={deleteType === 'bulk' ? confirmBulkDelete : confirmSingleDelete}
        message={deleteType === 'bulk' ? 'This will permanently delete all selected documents.' : 'This will permanently delete this document.'}
        itemName={deleteItemName}
        isBulk={deleteType === 'bulk'}
        count={selectedItems.length}
      />

      {/* Delete Confirmation Modal (document destinations) */}
      <DeleteConfirmationModal
        isOpen={isDeleteDestinationsModalOpen}
        onClose={() => {
          setIsDeleteDestinationsModalOpen(false)
          setPendingDestinationDeleteIds([])
        }}
        onConfirm={() => {
          handleDeleteDestinationRows(pendingDestinationDeleteIds)
          setPendingDestinationDeleteIds([])
          setIsDeleteDestinationsModalOpen(false)
        }}
        title="Delete selected destinations"
        message="This will permanently remove the selected destination row(s) from this document."
        isBulk={pendingDestinationDeleteIds.length > 1}
        count={pendingDestinationDeleteIds.length}
      />
    </div>
  )
}

export default Outbox
