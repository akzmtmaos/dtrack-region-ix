import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import type { DocumentDestinationRow } from './DocumentDestinationsModal'
import type { DocumentSource } from './DocumentDestinationsModal'

interface AddDestinationRowModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (row: Omit<DocumentDestinationRow, 'id'>) => void
  document: DocumentSource | null
  nextSequenceNo: number
}

const AddDestinationRowModal: React.FC<AddDestinationRowModalProps> = ({
  isOpen,
  onClose,
  onSave,
  document,
  nextSequenceNo
}) => {
  const { theme } = useTheme()
  const [routeNo, setRouteNo] = useState('')
  const [destinationOffice, setDestinationOffice] = useState('')
  const [employeeActionOfficer, setEmployeeActionOfficer] = useState('')
  const [actionRequired, setActionRequired] = useState('')
  const [dateReleased, setDateReleased] = useState('')
  const [timeReleased, setTimeReleased] = useState('')
  const [dateRequired, setDateRequired] = useState('')
  const [timeRequired, setTimeRequired] = useState('')
  const [remarks, setRemarks] = useState('')

  if (!isOpen || !document) return null

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'
  const inputBg = theme === 'dark' ? '#171717' : '#ffffff'
  const inputBorder = theme === 'dark' ? '#262626' : '#e5e5e5'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      documentControlNo: document.documentControlNo,
      routeNo: routeNo.trim() || `RN-${Date.now().toString().slice(-6)}`,
      sequenceNo: nextSequenceNo,
      destinationOffice,
      employeeActionOfficer,
      actionRequired,
      dateReleased,
      timeReleased,
      dateRequired,
      timeRequired,
      dateReceived: '',
      timeReceived: '',
      remarks,
      actionTaken: '',
      remarksOnActionTaken: '',
      dateActedUpon: '',
      timeActedUpon: ''
    })
    setRouteNo('')
    setDestinationOffice('')
    setEmployeeActionOfficer('')
    setActionRequired('')
    setDateReleased('')
    setTimeReleased('')
    setDateRequired('')
    setTimeRequired('')
    setRemarks('')
    onClose()
  }

  const handleClose = () => {
    setRouteNo('')
    setDestinationOffice('')
    setEmployeeActionOfficer('')
    setActionRequired('')
    setDateReleased('')
    setTimeReleased('')
    setDateRequired('')
    setTimeRequired('')
    setRemarks('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[10000]"
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div
        className="rounded-lg max-w-lg w-full mx-4 shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h3 className="text-base font-semibold" style={{ color: textPrimary }}>Add Destination</h3>
          <p className="text-xs mt-1" style={{ color: textSecondary }}>Document Control No.: {document.documentControlNo} (same for all) · Sequence: {nextSequenceNo}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Route No. (*)</label>
            <input
              type="text"
              value={routeNo}
              onChange={(e) => setRouteNo(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none"
              style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              placeholder="Per-destination route no. (e.g. R2026-000000049)"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Destination Office</label>
            <input
              type="text"
              value={destinationOffice}
              onChange={(e) => setDestinationOffice(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none"
              style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              placeholder="e.g. ARD - Health Facility Development Unit"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Employee (Action Officer)</label>
            <input
              type="text"
              value={employeeActionOfficer}
              onChange={(e) => setEmployeeActionOfficer(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none"
              style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              placeholder="e.g. Last name, First name, M"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Action Required</label>
            <input
              type="text"
              value={actionRequired}
              onChange={(e) => setActionRequired(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none"
              style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              placeholder="e.g. For Acceptance of Delivery, For Comment"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Date Released</label>
            <input
              type="date"
              value={dateReleased}
              onChange={(e) => setDateReleased(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none"
              style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Time Released</label>
            <input
              type="time"
              value={timeReleased}
              onChange={(e) => setTimeReleased(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none"
              style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Date Required</label>
            <input
              type="date"
              value={dateRequired}
              onChange={(e) => setDateRequired(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none"
              style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Time Required</label>
            <input
              type="time"
              value={timeRequired}
              onChange={(e) => setTimeRequired(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none"
              style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
          <div className="flex items-start gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px', paddingTop: '6px' }}>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none resize-none"
              style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md"
              style={{ color: textSecondary, backgroundColor: 'transparent' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium rounded-md text-white"
              style={{ backgroundColor: '#3ecf8e' }}
            >
              Add Destination
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDestinationRowModal
