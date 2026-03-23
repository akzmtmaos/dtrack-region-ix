import React, { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext'
import type { DocumentDestinationRow } from './DocumentDestinationsModal'
import type { DocumentSource } from './DocumentDestinationsModal'
import { apiService } from '../../services/api'
import SearchableSelect from '../SearchableSelect'

/** Map API user row to a stable shape (snake_case from backend). */
interface OfficeUserRow {
  id: string | number
  employeeCode: string
  firstName: string
  lastName: string
  middleName: string
  office: string
  userLevel: string
  verified: boolean
}

function mapRowFromApi(item: Record<string, unknown>): OfficeUserRow {
  return {
    id: item.id as string | number,
    employeeCode: String(item.employee_code ?? item.employeeCode ?? ''),
    lastName: String(item.last_name ?? item.lastName ?? ''),
    firstName: String(item.first_name ?? item.firstName ?? ''),
    middleName: String(item.middle_name ?? item.middleName ?? ''),
    office: String(item.office ?? ''),
    userLevel: String(item.user_level ?? item.userLevel ?? ''),
    verified: item.verified !== false,
  }
}

/** Label shown in dropdown; stored value uses `Name (CODE)` for inbox / identity matching. */
function formatActionOfficerOptionLabel(u: OfficeUserRow): string {
  const fn = (u.firstName || '').trim()
  const mn = (u.middleName || '').trim()
  const ln = (u.lastName || '').trim()
  const mid = mn && mn !== '-' ? mn : ''
  const parts = [fn, mid, ln].filter((p) => p.length > 0)
  let name = parts.length > 0 ? parts.join(' ') : fn
  if (!name) name = (u.employeeCode || '').trim()
  const code = (u.employeeCode || '').trim()
  return code ? `${name} (${code})` : name
}

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
  const [destinationOffice, setDestinationOffice] = useState('')
  const [employeeActionOfficer, setEmployeeActionOfficer] = useState('')
  const [allUsers, setAllUsers] = useState<OfficeUserRow[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [actionRequired, setActionRequired] = useState('')
  const [dateReleased, setDateReleased] = useState('')
  const [timeReleased, setTimeReleased] = useState('')
  const [dateRequired, setDateRequired] = useState('')
  const [timeRequired, setTimeRequired] = useState('')
  const [remarks, setRemarks] = useState('')
  const [offices, setOffices] = useState<Array<{ id: number; office: string }>>([])
  const [actionRequiredOptions, setActionRequiredOptions] = useState<Array<{ id: number; action_required: string }>>([])

  useEffect(() => {
    if (!isOpen) return
    const fetchLookups = async () => {
      try {
        const [officeRes, actionReqRes, usersRes] = await Promise.all([
          apiService.getOffice(),
          apiService.getActionRequired(),
          apiService.getUsers(),
        ])

        if (officeRes.success && officeRes.data) {
          const mapped = (officeRes.data as any[]).map((item: any) => ({
            id: item.id,
            office: item.office || '',
          }))
          setOffices(mapped)
        }

        if (actionReqRes.success && actionReqRes.data) {
          const mappedActions = (actionReqRes.data as any[]).map((item: any) => ({
            id: item.id,
            action_required: item.action_required || '',
          }))
          setActionRequiredOptions(mappedActions)
        }

        if (usersRes.success && usersRes.data) {
          const raw = Array.isArray(usersRes.data) ? usersRes.data : []
          setAllUsers(raw.map((item) => mapRowFromApi(item as Record<string, unknown>)))
        } else {
          setAllUsers([])
        }
      } catch (error) {
        console.error('Failed to fetch lookups for destination modal:', error)
      }
    }
    fetchLookups()
  }, [isOpen])

  const usersForDestinationOffice = useMemo(() => {
    const o = destinationOffice.trim()
    if (!o) return []
    return allUsers.filter((u) => u.verified && (u.office || '').trim() === o)
  }, [allUsers, destinationOffice])

  const actionOfficerSelectOptions = useMemo(() => {
    return usersForDestinationOffice.map((u) => {
      const label = formatActionOfficerOptionLabel(u)
      return {
        id: `${String(u.id)}-${u.employeeCode}`,
        value: label,
        label,
      }
    })
  }, [usersForDestinationOffice])

  if (!isOpen || !document) return null

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'
  const inputBg = theme === 'dark' ? '#171717' : '#ffffff'
  const inputBorder = theme === 'dark' ? '#262626' : '#e5e5e5'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!destinationOffice.trim()) {
      setFormError('Select a destination office.')
      return
    }
    if (!employeeActionOfficer.trim()) {
      setFormError('Select an employee (action officer) for this office.')
      return
    }
    // Route No. is generated by the server (R2026-000000001, R2026-000000002, ...). Send empty to use server default.
    onSave({
      documentControlNo: document.documentControlNo,
      routeNo: '',
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
    setDestinationOffice('')
    setEmployeeActionOfficer('')
    setFormError(null)
    setActionRequired('')
    setDateReleased('')
    setTimeReleased('')
    setDateRequired('')
    setTimeRequired('')
    setRemarks('')
    onClose()
  }

  const handleClose = () => {
    setDestinationOffice('')
    setEmployeeActionOfficer('')
    setFormError(null)
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
          <p className="text-[11px] mt-2 leading-snug" style={{ color: textSecondary }}>
            Routing starts here: choose the office, then the employee at that office who will act on this document.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <p className="text-xs rounded-md px-2.5 py-2" style={{ color: '#fecaca', backgroundColor: theme === 'dark' ? 'rgba(127,29,29,0.35)' : '#fef2f2' }}>
              {formError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Destination Office</label>
            <div className="flex-1">
              <SearchableSelect
                options={[...offices].sort((a, b) =>
                  a.office.localeCompare(b.office)
                ).map(o => ({
                  id: o.id,
                  value: o.office,
                  label: o.office,
                }))}
                value={destinationOffice}
                onChange={(value) => {
                  setDestinationOffice(value)
                  setEmployeeActionOfficer('')
                  setFormError(null)
                }}
                placeholder="Select destination office"
                style={{ borderColor: inputBorder }}
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <label className="text-xs font-medium whitespace-nowrap pt-1.5" style={{ color: textPrimary, width: '160px' }}>Employee (Action Officer)</label>
            <div className="flex-1 space-y-1">
              <SearchableSelect
                options={actionOfficerSelectOptions}
                value={employeeActionOfficer}
                onChange={(value) => {
                  setEmployeeActionOfficer(value)
                  setFormError(null)
                }}
                placeholder={
                  !destinationOffice.trim()
                    ? 'Select an office first'
                    : actionOfficerSelectOptions.length === 0
                      ? 'No users in this office'
                      : 'Select employee'
                }
                disabled={!destinationOffice.trim() || actionOfficerSelectOptions.length === 0}
                style={{ borderColor: inputBorder }}
              />
              {destinationOffice.trim() && actionOfficerSelectOptions.length === 0 && (
                <p className="text-[11px]" style={{ color: textSecondary }}>
                  No registered accounts match this office name. Ensure users have the same office in Profile / Registered Users.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '160px' }}>Action Required</label>
            <div className="flex-1">
              <SearchableSelect
                options={[...actionRequiredOptions].sort((a, b) =>
                  a.action_required.localeCompare(b.action_required)
                ).map(a => ({
                  id: a.id,
                  value: a.action_required,
                  label: a.action_required,
                }))}
                value={actionRequired}
                onChange={(value) => setActionRequired(value)}
                placeholder="Select action required"
                style={{ borderColor: inputBorder }}
              />
            </div>
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
            <div className="flex-1 relative">
              <input
                type="time"
                value={timeReleased}
                onChange={(e) => setTimeReleased(e.target.value)}
                className="w-full px-2.5 py-1.5 pr-7 text-xs rounded-md outline-none appearance-none"
                style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              />
              <svg
                className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: textSecondary }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l2 2m5-2a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
            <div className="flex-1 relative">
              <input
                type="time"
                value={timeRequired}
                onChange={(e) => setTimeRequired(e.target.value)}
                className="w-full px-2.5 py-1.5 pr-7 text-xs rounded-md outline-none appearance-none"
                style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              />
              <svg
                className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: textSecondary }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l2 2m5-2a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
