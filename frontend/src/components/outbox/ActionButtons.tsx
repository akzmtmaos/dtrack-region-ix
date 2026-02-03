import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'

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
  onAddDestination: (document: Document) => void
  onDelete: (document: Document) => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  document,
  onView,
  onRoutingSlip,
  onEdit,
  onAddDestination,
  onDelete
}) => {
  const { theme } = useTheme()
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const iconClass = theme === 'dark'
    ? 'text-gray-400 hover:text-gray-200'
    : 'text-gray-500 hover:text-gray-800'

  const showTooltip = (label: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    setTooltip(label)
    setTooltipPos({
      left: rect.left + rect.width / 2,
      top: rect.bottom + 6
    })
  }

  const hideTooltip = () => {
    setTooltip(null)
    setTooltipPos(null)
  }

  const TooltipLabel = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div
      className="relative inline-flex flex-col items-center"
      onMouseEnter={(e) => showTooltip(label, e.currentTarget)}
      onMouseLeave={hideTooltip}
    >
      {children}
    </div>
  )

  const tooltipEl =
    mounted &&
    tooltip &&
    tooltipPos &&
    typeof window !== 'undefined' &&
    window.document?.body &&
    createPortal(
      <span
        className="fixed px-2 py-1 text-xs font-medium whitespace-nowrap rounded border pointer-events-none tooltip-animate-in"
        style={{
          left: tooltipPos.left,
          top: tooltipPos.top,
          transform: 'translate(-50%, 0)',
          backgroundColor: theme === 'dark' ? '#171717' : '#000',
          color: '#fff',
          borderColor: 'rgba(255,255,255,0.9)',
          zIndex: 2147483647
        }}
      >
        {tooltip}
      </span>,
      window.document.body
    )

  return (
    <div className="flex items-center space-x-2">
      <TooltipLabel label="View">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onView(document)
          }}
          className={`p-1 rounded transition-colors ${iconClass}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </TooltipLabel>

      <TooltipLabel label="Routing Slip">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRoutingSlip(document)
          }}
          className={`p-1 rounded transition-colors ${iconClass}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </TooltipLabel>

      <TooltipLabel label="Edit">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(document)
          }}
          className={`p-1 rounded transition-colors ${iconClass}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </TooltipLabel>

      <TooltipLabel label="Add Destination">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddDestination(document)
          }}
          className={`p-1 rounded transition-colors ${iconClass}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </button>
      </TooltipLabel>

      <TooltipLabel label="Delete">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(document)
          }}
          className={`p-1 rounded transition-colors ${iconClass}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </TooltipLabel>
      {tooltipEl}
    </div>
  )
}

export default ActionButtons

