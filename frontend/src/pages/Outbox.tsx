import React, { useState } from 'react'
import AddDocumentModal from '../components/outbox/AddDocumentModal'
import DocumentDetailModal from '../components/outbox/DocumentDetailModal'
import ActionButtons from '../components/outbox/ActionButtons'
import RoutingSlipModal from '../components/outbox/RoutingSlipModal'
import InlineEditModal from '../components/outbox/InlineEditModal'
import Pagination from '../components/Pagination'

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
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) {
      setDocuments(prev => prev.filter(doc => !selectedItems.includes(doc.id)))
      setSelectedItems([])
    }
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

  const handleDeleteDocument = (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== id))
      if (selectedDocument?.id === id) {
        setIsDetailModalOpen(false)
        setSelectedDocument(null)
      }
    }
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

  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Outbox</h1>
      
      <div className="flex justify-end items-center gap-3 mb-3">
        <button
          onClick={handleDeleteSelected}
          disabled={selectedItems.length === 0}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            selectedItems.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          Delete Selected Items {selectedItems.length > 0 && `(${selectedItems.length})`}
        </button>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add</span>
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors w-64"
          />
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <hr className="mb-4 border-gray-300" />
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={documents.length > 0 && selectedItems.length === documents.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Control No. <RequiredAsterisk />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route No. <RequiredAsterisk />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Office Control No. <RequiredAsterisk />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject <RequiredAsterisk />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No documents found
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(doc)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(doc.id)}
                        onChange={() => handleSelectItem(doc.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doc.documentControlNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {doc.routeNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {doc.officeControlNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {doc.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {doc.documentType || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {doc.sourceType || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
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
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={documents.length}
          itemsPerPage={10}
        />
      </div>

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
    </div>
  )
}

export default Outbox
