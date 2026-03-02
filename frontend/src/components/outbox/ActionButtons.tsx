import React, { useState, useEffect, useRef } from 'react'
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
  document: doc,
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
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipVisibleRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    setMounted(true)
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  const hideTooltip = () => {
    tooltipVisibleRef.current = false
    if (isMountedRef.current) {
      setTooltip(null)
      setTooltipPos(null)
    }
  }

  // Hide tooltip when pointer leaves this row's actions (fixes stuck tooltips when moving between rows)
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!tooltipVisibleRef.current || !isMountedRef.current) return
      const el = e.target as Node
      if (!containerRef.current?.contains(el)) hideTooltip()
    }
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => document.removeEventListener('pointermove', onPointerMove)
  }, [])

  const baseButtonClasses =
    'inline-flex items-center justify-center h-7 w-8 rounded-lg border transition-colors'

  const showTooltip = (label: string, el: HTMLElement) => {
    tooltipVisibleRef.current = true
    const rect = el.getBoundingClientRect()
    setTooltip(label)
    setTooltipPos({
      left: rect.left + rect.width / 2,
      top: rect.bottom + 6
    })
  }

  const TooltipLabel = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div
      className="relative inline-flex flex-col items-center"
      onMouseEnter={(e) => showTooltip(label, e.currentTarget)}
      onMouseLeave={hideTooltip}
      onPointerLeave={hideTooltip}
    >
      {children}
    </div>
  )

  if (!doc) return null

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
    <div
      ref={containerRef}
      className="flex items-center space-x-2"
      onMouseLeave={hideTooltip}
      onPointerLeave={hideTooltip}
    >
      <TooltipLabel label="View">
        <button
          onClick={(e) => {
            e.stopPropagation()
            hideTooltip()
            onView(doc)
          }}
          className={`${baseButtonClasses} ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-100 bg-gray-900 hover:bg-gray-800'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </TooltipLabel>

      <TooltipLabel label="Routing Slip">
        <button
          onClick={(e) => {
            e.stopPropagation()
            hideTooltip()
            onRoutingSlip(doc)
          }}
          className={`${baseButtonClasses} ${
            theme === 'dark'
              ? 'border-indigo-500 text-indigo-200 bg-gray-900 hover:bg-indigo-900/30'
              : 'border-indigo-500 text-indigo-600 bg-white hover:bg-indigo-50'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </TooltipLabel>

      <TooltipLabel label="Edit">
        <button
          onClick={(e) => {
            e.stopPropagation()
            hideTooltip()
            onEdit(doc)
          }}
          className={`${baseButtonClasses} ${
            theme === 'dark'
              ? 'border-amber-500 text-amber-200 bg-gray-900 hover:bg-amber-900/30'
              : 'border-amber-500 text-amber-700 bg-white hover:bg-amber-50'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </TooltipLabel>

      <TooltipLabel label="Add Destination">
        <button
          onClick={(e) => {
            e.stopPropagation()
            hideTooltip()
            onAddDestination(doc)
          }}
          className={`${baseButtonClasses} ${
            theme === 'dark'
              ? 'border-emerald-600 text-emerald-200 bg-gray-900 hover:bg-emerald-900/30'
              : 'border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </button>
      </TooltipLabel>

      <TooltipLabel label="Delete">
        <button
          onClick={(e) => {
            e.stopPropagation()
            hideTooltip()
            onDelete(doc)
          }}
          className={`${baseButtonClasses} ${
            theme === 'dark'
              ? 'border-red-500 text-red-200 bg-gray-900 hover:bg-red-900/30'
              : 'border-red-500 text-red-700 bg-white hover:bg-red-50'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </TooltipLabel>
      {tooltipEl}
    </div>
  )
}

export default ActionButtons

