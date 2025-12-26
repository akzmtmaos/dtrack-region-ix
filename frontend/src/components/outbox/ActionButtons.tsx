import React from 'react'

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

interface ActionButtonsProps {
  document: Document
  onView: (document: Document) => void
  onRoutingSlip: (document: Document) => void
  onEdit: (document: Document) => void
  onInlineEdit: (document: Document) => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  document,
  onView,
  onRoutingSlip,
  onEdit,
  onInlineEdit
}) => {
  return (
    <div className="flex space-x-2">
      {/* View Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onView(document)
        }}
        className="text-green-600 hover:text-green-900 transition-colors"
        title="View"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {/* Routing Slip Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRoutingSlip(document)
        }}
        className="text-blue-600 hover:text-blue-900 transition-colors"
        title="Routing Slip"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit(document)
        }}
        className="text-purple-600 hover:text-purple-900 transition-colors"
        title="Edit"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {/* Inline Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onInlineEdit(document)
        }}
        className="text-orange-600 hover:text-orange-900 transition-colors"
        title="Inline Edit"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  )
}

export default ActionButtons

