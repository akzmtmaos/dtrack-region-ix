import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { apiService } from '../../services/api'
import Button from '../Button'

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

interface DocumentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  onUpdate?: (document: Document) => void
  onEditRequest?: (document: Document) => void
  mode?: 'view' | 'edit'
}

const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document,
  onEditRequest
}) => {
  const { theme } = useTheme()
  const [attachmentLoading, setAttachmentLoading] = useState(false)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)

  const hasAttachment = !!(document?.attachedDocumentFilename?.trim() || document?.attachmentList?.trim())

  const handleDownloadAttachment = async () => {
    if (!document?.id) return
    setAttachmentLoading(true)
    setAttachmentError(null)
    const res = await apiService.getDocumentAttachmentUrl(document.id)
    setAttachmentLoading(false)
    const url = (res as { url?: string }).url
    if (res.success && url) {
      try {
        const response = await fetch(url)
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = objectUrl
        a.download = document.attachedDocumentFilename?.trim() || 'attachment'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(objectUrl)
      } catch {
        setAttachmentError('Download failed')
      }
    } else {
      setAttachmentError(res.error || 'Could not get download link')
    }
  }

  if (!isOpen || !document) return null

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'
  const valueBg = theme === 'dark' ? '#262626' : '#f5f5f5'

  const Value = ({ children }: { children: React.ReactNode }) => (
    <div
      className="flex-1 px-2.5 py-1.5 text-xs rounded-md min-h-[28px] flex items-center"
      style={{ backgroundColor: valueBg, color: textPrimary }}
    >
      {children != null && children !== '' ? children : <span style={{ color: textSecondary }}>—</span>}
    </div>
  )

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      onClick={onClose}
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - same as Add modal */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>
            Document Details
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            Full document information. Click Edit to update.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {/* Document Control No., Route No. - view only */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                Document Control No.
              </label>
              <Value>{document.documentControlNo}</Value>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                Route No.
              </label>
              <Value>{document.routeNo}</Value>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                Subject
              </label>
              <Value>{document.subject}</Value>
            </div>

            {/* Document Type */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                Document Type
              </label>
              <Value>{document.documentType}</Value>
            </div>

            {/* Source Type */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                Source Type
              </label>
              <Value>{document.sourceType}</Value>
            </div>

            {/* Internal - same layout as Add modal */}
            {document.sourceType === 'Internal' && (
              <div className="space-y-4 pl-4" style={{ borderLeft: `2px solid ${borderColor}` }}>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '183px' }}>
                    Internal Originating Office
                  </label>
                  <Value>{document.internalOriginatingOffice}</Value>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '183px' }}>
                    Internal Originating Employee
                  </label>
                  <Value>{document.internalOriginatingEmployee}</Value>
                </div>
              </div>
            )}

            {/* External - same layout as Add modal */}
            {document.sourceType === 'External' && (
              <div className="space-y-4 pl-4" style={{ borderLeft: `2px solid ${borderColor}` }}>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '183px' }}>
                    External Originating Office
                  </label>
                  <Value>{document.externalOriginatingOffice}</Value>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '183px' }}>
                    External Originating Employee
                  </label>
                  <Value>{document.externalOriginatingEmployee}</Value>
                </div>
              </div>
            )}

            {/* No. of Pages */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                No. of Pages
              </label>
              <Value>{document.noOfPages}</Value>
            </div>

            {/* Attach Document Filename */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                Attach Document Filename
              </label>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <Value>{document.attachedDocumentFilename}</Value>
                {hasAttachment && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadAttachment}
                      disabled={attachmentLoading}
                      className="flex-shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                      style={{ color: '#ffffff', backgroundColor: '#3ecf8e' }}
                      onMouseEnter={(e) => { if (!attachmentLoading) e.currentTarget.style.backgroundColor = '#35b87a' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3ecf8e' }}
                    >
                      {attachmentLoading ? 'Downloading…' : 'Download'}
                    </button>
                  </>
                )}
              </div>
            </div>
            {hasAttachment && attachmentError && (
              <div className="flex items-center gap-3">
                <div style={{ width: '200px' }} />
                <span className="text-xs" style={{ color: '#ef4444' }}>{attachmentError}</span>
              </div>
            )}

            {/* Remarks */}
            <div className="flex items-start gap-3">
              <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px', paddingTop: '4px' }}>
                Remarks
              </label>
              <div
                className="flex-1 px-2.5 py-1.5 text-xs rounded-md min-h-[52px] whitespace-pre-wrap"
                style={{ backgroundColor: valueBg, color: textPrimary }}
              >
                {document.remarks != null && document.remarks !== '' ? document.remarks : <span style={{ color: textSecondary }}>—</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - same style as Add modal */}
        <div
          className="px-6 py-4 flex justify-end gap-2"
          style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: modalBg }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{ color: textSecondary, backgroundColor: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Close
          </button>
          {onEditRequest && (
            <button
              type="button"
              onClick={() => onEditRequest(document)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{ color: '#ffffff', backgroundColor: '#3ecf8e' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#35b87a')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3ecf8e')}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentDetailModal
