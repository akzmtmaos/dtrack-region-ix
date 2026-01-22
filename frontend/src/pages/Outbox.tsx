import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import AddDocumentModal from '../components/outbox/AddDocumentModal'
import DocumentDetailModal from '../components/outbox/DocumentDetailModal'
import ActionButtons from '../components/outbox/ActionButtons'
import RoutingSlipModal from '../components/outbox/RoutingSlipModal'
import InlineEditModal from '../components/outbox/InlineEditModal'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import Pagination from '../components/Pagination'
import Button from '../components/Button'
import Input from '../components/Input'
import Table from '../components/Table'

interface Document {
  id: number
  documentControlNo: string
  routeNo: string
  officeControlNo: string
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
  referenceDocumentControlNo1: string
  referenceDocumentControlNo2: string
  referenceDocumentControlNo3: string
  referenceDocumentControlNo4: string
  referenceDocumentControlNo5: string
}

const Outbox: React.FC = () => {
  const { theme } = useTheme()
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRoutingSlipModalOpen, setIsRoutingSlipModalOpen] = useState(false)
  const [isInlineEditModalOpen, setIsInlineEditModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [detailModalMode, setDetailModalMode] = useState<'view' | 'edit'>('view')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(1)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteItemName, setDeleteItemName] = useState<string>('')

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
    setDocuments(prev => prev.filter(doc => !selectedItems.includes(doc.id)))
    setSelectedItems([])
  }

  const handleAddDocument = (document: Partial<Document>) => {
    const newDocument: Document = {
      id: Date.now(),
      documentControlNo: document.documentControlNo || '',
      routeNo: document.routeNo || '',
      officeControlNo: document.officeControlNo || '',
      subject: document.subject || '',
      documentType: document.documentType || '',
      sourceType: document.sourceType || '',
      internalOriginatingOffice: document.internalOriginatingOffice || '',
      internalOriginatingEmployee: document.internalOriginatingEmployee || '',
      externalOriginatingOffice: document.externalOriginatingOffice || '',
      externalOriginatingEmployee: document.externalOriginatingEmployee || '',
      noOfPages: document.noOfPages || '',
      attachedDocumentFilename: document.attachedDocumentFilename || '',
      attachmentList: document.attachmentList || '',
      userid: document.userid || '',
      inSequence: document.inSequence || '',
      remarks: document.remarks || '',
      referenceDocumentControlNo1: document.referenceDocumentControlNo1 || '',
      referenceDocumentControlNo2: document.referenceDocumentControlNo2 || '',
      referenceDocumentControlNo3: document.referenceDocumentControlNo3 || '',
      referenceDocumentControlNo4: document.referenceDocumentControlNo4 || '',
      referenceDocumentControlNo5: document.referenceDocumentControlNo5 || ''
    }
    setDocuments(prev => [...prev, newDocument])
  }

  const handleRowClick = (document: Document) => {
    setSelectedDocument(document)
    setIsDetailModalOpen(true)
  }

  const handleUpdateDocument = (updatedDocument: Document) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === updatedDocument.id ? updatedDocument : doc
    ))
    setSelectedDocument(updatedDocument)
  }

  const handleDeleteDocument = (document: Document) => {
    setDeleteType('single')
    setDeleteId(document.id)
    setDeleteItemName(document.documentControlNo || document.subject || 'this document')
    setIsDeleteModalOpen(true)
  }

  const confirmSingleDelete = () => {
    if (!deleteId) return
    setDocuments(prev => prev.filter(doc => doc.id !== deleteId))
    if (selectedDocument?.id === deleteId) {
      setIsDetailModalOpen(false)
      setSelectedDocument(null)
    }
    setDeleteId(null)
    setDeleteItemName('')
  }

  const handleView = (document: Document) => {
    setSelectedDocument(document)
    setDetailModalMode('view')
    setIsDetailModalOpen(true)
  }

  const handleRoutingSlip = (document: Document) => {
    setSelectedDocument(document)
    setIsRoutingSlipModalOpen(true)
  }

  const handleEdit = (document: Document) => {
    setSelectedDocument(document)
    setDetailModalMode('edit')
    setIsDetailModalOpen(true)
  }

  const handleInlineEdit = (document: Document) => {
    setSelectedDocument(document)
    setIsInlineEditModalOpen(true)
  }

  const handleInlineEditSave = (updatedDocument: Document) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === updatedDocument.id ? updatedDocument : doc
    ))
    setSelectedDocument(updatedDocument)
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
                <th>Office Control No.</th>
                <th>Subject</th>
                <th>Document Type</th>
                <th>Source Type</th>
              </tr>
            </thead>
            <tbody>
              ${documents.length === 0 
                ? '<tr><td colspan="6" class="no-data">No documents found</td></tr>'
                : documents.map(doc => `
                  <tr>
                    <td>${doc.documentControlNo || '—'}</td>
                    <td>${doc.routeNo || '—'}</td>
                    <td>${doc.officeControlNo || '—'}</td>
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
    const headers = ['Document Control No.', 'Route No.', 'Office Control No.', 'Subject', 'Document Type', 'Source Type']
    const csvRows = [headers.join(',')]

    documents.forEach(doc => {
      const row = [
        `"${(doc.documentControlNo || '').replace(/"/g, '""')}"`,
        `"${(doc.routeNo || '').replace(/"/g, '""')}"`,
        `"${(doc.officeControlNo || '').replace(/"/g, '""')}"`,
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
                <th>Office Control No.</th>
                <th>Subject</th>
                <th>Document Type</th>
                <th>Source Type</th>
              </tr>
            </thead>
            <tbody>
              ${documents.length === 0 
                ? '<tr><td colspan="6" class="no-data">No documents found</td></tr>'
                : documents.map(doc => `
                  <tr>
                    <td>${doc.documentControlNo || '—'}</td>
                    <td>${doc.routeNo || '—'}</td>
                    <td>${doc.officeControlNo || '—'}</td>
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

  return (
    <div className="pt-4 pb-8">
        <h1 className={`text-2xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Outbox</h1>
        
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
              onClick={() => setIsAddModalOpen(true)}
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
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
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
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Document Control No. <RequiredAsterisk />
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Route No. <RequiredAsterisk />
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Office Control No. <RequiredAsterisk />
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Subject <RequiredAsterisk />
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Document Type
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Source Type
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
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
                  <td colSpan={8} className={`px-6 py-16 text-center ${
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
                documents.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className={`transition-all duration-150 cursor-pointer ${
                      theme === 'dark' 
                        ? 'hover:bg-dark-hover/50 active:bg-dark-hover' 
                        : 'hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    onClick={() => handleRowClick(doc)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(doc.id)}
                        onChange={() => handleSelectItem(doc.id)}
                        className={`rounded text-[#3BA55C] focus:ring-2 focus:ring-[#3BA55C] focus:ring-offset-0 transition-all ${
                          theme === 'dark' ? 'border-[#4a4b4c] bg-dark-panel' : 'border-gray-300 bg-white'
                        }`}
                      />
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {doc.documentControlNo || <span className="text-gray-500 italic">—</span>}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {doc.routeNo || <span className="text-gray-500 italic">—</span>}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {doc.officeControlNo || <span className="text-gray-500 italic">—</span>}
                    </td>
                    <td className={`px-6 py-4 text-sm max-w-xs ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <div className="truncate" title={doc.subject}>
                        {doc.subject || <span className="text-gray-500 italic">—</span>}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-left ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {doc.documentType || <span className="text-gray-500 italic">—</span>}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {doc.sourceType || <span className="text-gray-500 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <ActionButtons
                        document={doc}
                        onView={handleView}
                        onRoutingSlip={handleRoutingSlip}
                        onEdit={handleEdit}
                        onInlineEdit={handleInlineEdit}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDocument}
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
        mode={detailModalMode}
      />

      {/* Routing Slip Modal */}
      <RoutingSlipModal
        isOpen={isRoutingSlipModalOpen}
        onClose={() => {
          setIsRoutingSlipModalOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
      />

      {/* Inline Edit Modal */}
      <InlineEditModal
        isOpen={isInlineEditModalOpen}
        onClose={() => {
          setIsInlineEditModalOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
        onSave={handleInlineEditSave}
      />

      {/* Delete Confirmation Modal */}
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
    </div>
  )
}

export default Outbox
