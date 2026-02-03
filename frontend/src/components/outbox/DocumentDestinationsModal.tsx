import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Button from '../Button'

export interface DocumentSource {
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

export interface DocumentDestinationRow {
  id: number
  documentControlNo: string
  routeNo: string
  sequenceNo: number
  destinationOffice: string
  employeeActionOfficer: string
  actionRequired: string
  dateReleased: string
  timeReleased: string
  dateRequired: string
  timeRequired: string
  dateReceived: string
  timeReceived: string
  remarks: string
  actionTaken: string
  remarksOnActionTaken: string
  dateActedUpon: string
  timeActedUpon: string
}

interface DocumentDestinationsModalProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentSource | null
  destinations: DocumentDestinationRow[]
  onAddDestination: (document: DocumentSource) => void
  onDeleteDestinations: (ids: number[]) => void
  onDestinationsChange?: (destinations: DocumentDestinationRow[]) => void
}

const DocumentDestinationsModal: React.FC<DocumentDestinationsModalProps> = ({
  isOpen,
  onClose,
  document,
  destinations,
  onAddDestination,
  onDeleteDestinations
}) => {
  const { theme } = useTheme()
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<number[]>([])

  if (!isOpen || !document) return null

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'
  const valueBg = theme === 'dark' ? '#262626' : '#f5f5f5'

  const refs = [
    document.referenceDocumentControlNo1,
    document.referenceDocumentControlNo2,
    document.referenceDocumentControlNo3,
    document.referenceDocumentControlNo4,
    document.referenceDocumentControlNo5
  ].filter(Boolean)

  const Value = ({ children }: { children: React.ReactNode }) => (
    <div
      className="flex-1 px-2.5 py-1.5 text-xs rounded-md min-h-[28px] flex items-center"
      style={{ backgroundColor: valueBg, color: textPrimary }}
    >
      {children != null && children !== '' ? children : <span style={{ color: textSecondary }}>—</span>}
    </div>
  )

  const handleSelectAllDestinations = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDestinationIds(destinations.map(d => d.id))
    } else {
      setSelectedDestinationIds([])
    }
  }

  const handleSelectDestination = (id: number) => {
    setSelectedDestinationIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDeleteSelected = () => {
    if (selectedDestinationIds.length === 0) return
    onDeleteDestinations(selectedDestinationIds)
    setSelectedDestinationIds([])
  }

  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '')
  const formatTime = (t: string) => (t ? new Date(`1970-01-01T${t}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '')

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      onClick={onClose}
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="rounded-lg max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Master Record TABLE: Document Source (OUTBOX) */}
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#3ecf8e' }}>
            Master Record TABLE: Document Source (OUTBOX)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs hover:underline"
            style={{ color: textSecondary }}
          >
            Back to master page
          </button>
        </div>

        {/* Master record - read-only document source fields */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3 text-xs mb-6">
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>Document Control No.</label>
              <Value>{document.documentControlNo}</Value>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>Route No.</label>
              <Value>{document.routeNo}</Value>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>Subject</label>
              <Value>{document.subject}</Value>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>Document Type</label>
              <Value>{document.documentType}</Value>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>Source Type</label>
              <Value>{document.sourceType}</Value>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>No. of Pages</label>
              <Value>{document.noOfPages}</Value>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>Attached Document Filename</label>
              <Value>{document.attachedDocumentFilename}</Value>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>Remarks</label>
              <div className="flex-1 px-2.5 py-1.5 rounded-md text-xs whitespace-pre-wrap" style={{ backgroundColor: valueBg, color: textPrimary }}>
                {document.remarks != null && document.remarks !== '' ? document.remarks : <span style={{ color: textSecondary }}>—</span>}
              </div>
            </div>
          </div>

          {/* TABLE: Document Destination */}
          <div className="mb-4">
            <h3 className="text-base font-semibold mb-3" style={{ color: textPrimary }}>
              TABLE: Document Destination
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <Button
                onClick={() => onAddDestination(document)}
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
                onClick={handleDeleteSelected}
                disabled={selectedDestinationIds.length === 0}
                variant="danger"
              >
                Delete Selected {selectedDestinationIds.length > 0 && `(${selectedDestinationIds.length})`}
              </Button>
            </div>

            <div className="rounded-lg border overflow-x-auto" style={{ borderColor }}>
              <table className="min-w-full divide-y" style={{ borderColor }}>
                <thead className={theme === 'dark' ? 'bg-dark-hover/60' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      <input
                        type="checkbox"
                        checked={destinations.length > 0 && selectedDestinationIds.length === destinations.length}
                        onChange={handleSelectAllDestinations}
                        className={`rounded ${theme === 'dark' ? 'bg-dark-panel border-[#4a4b4c]' : 'border-gray-300'}`}
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Route No.</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Sequence No.</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Destination Office</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Employee (Action Officer)</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Action Required</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Date Released</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Time Released</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Date Required</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Time Required</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Remarks</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Action Taken</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#4a4b4c]' : 'divide-gray-200'}`}>
                  {destinations.length === 0 ? (
                    <tr>
                    <td colSpan={12} className="px-3 py-6 text-center text-sm" style={{ color: textSecondary }}>
                        No destinations. Click Add to add a destination.
                      </td>
                    </tr>
                  ) : (
                    destinations.map((dest) => (
                      <tr
                        key={dest.id}
                        className={theme === 'dark' ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedDestinationIds.includes(dest.id)}
                            onChange={() => handleSelectDestination(dest.id)}
                            className={`rounded ${theme === 'dark' ? 'bg-dark-panel border-[#4a4b4c]' : 'border-gray-300'}`}
                          />
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{dest.documentControlNo || '—'}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{dest.routeNo || '—'}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{dest.sequenceNo}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{dest.destinationOffice || '—'}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{dest.employeeActionOfficer || '—'}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{dest.actionRequired || '—'}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{formatDate(dest.dateReleased)}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{formatTime(dest.timeReleased)}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{formatDate(dest.dateRequired)}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{formatTime(dest.timeRequired)}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{dest.remarks || '—'}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{dest.actionTaken || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {destinations.length > 0 && (
              <p className="mt-2 text-xs" style={{ color: textSecondary }}>
                Records 1 to {destinations.length} of {destinations.length}
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end" style={{ borderTop: `1px solid ${borderColor}` }}>
          <button
            type="button"
            onClick={onClose}
            className="text-xs hover:underline"
            style={{ color: textSecondary }}
          >
            Back to master page
          </button>
        </div>
      </div>
    </div>
  )
}

export default DocumentDestinationsModal
