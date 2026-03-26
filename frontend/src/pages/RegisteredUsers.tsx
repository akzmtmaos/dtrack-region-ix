import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { apiService } from '../services/api'
import { usePagination } from '../hooks/usePagination'
import Input from '../components/Input'
import PageSizeSelect from '../components/PageSizeSelect'
import SearchableSelect from '../components/SearchableSelect'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { EMPLOYEE_CODE_MAX_LENGTH } from '../constants/user'
import {
  canManageRegisteredUsers,
  canVerifyRegisteredUser,
  isActionOfficer,
  isAdministrator,
} from '../utils/userPermissions'

interface RegisteredUser {
  id: number | string
  employeeCode: string
  lastName: string
  firstName: string
  middleName: string
  office: string
  userLevel: string
  officeRepresentative: string
  verified: boolean
  source?: 'users' | 'profiles'
}

const RegisteredUsers: React.FC = () => {
  const { theme } = useTheme()
  const { user: authUser } = useAuth()
  const { showSuccess, showError } = useToast()
  const actingUserOpts = { actingEmployeeCode: authUser?.employeeCode?.trim() || undefined }
  const canAdmin = authUser ? canManageRegisteredUsers(authUser) : false
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [filterOffice, setFilterOffice] = useState('')
  const [filterUserLevel, setFilterUserLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all')
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortBy, setSortBy] = useState<'lastName' | 'firstName' | 'employeeCode' | 'office' | 'userLevel' | 'verified'>('lastName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Manual add user state (admin)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addPassword, setAddPassword] = useState('')
  const [addConfirmPassword, setAddConfirmPassword] = useState('')
  const [addFirstName, setAddFirstName] = useState('')
  const [addLastName, setAddLastName] = useState('')
  const [addMiddleInitial, setAddMiddleInitial] = useState('')
  const [addEmployeeCode, setAddEmployeeCode] = useState('')
  const [addOffice, setAddOffice] = useState('')
  const [addUserLevel, setAddUserLevel] = useState('')
  const [addOfficeRepresentative, setAddOfficeRepresentative] = useState('')
  const [addError, setAddError] = useState('')
  const [addSuccessMessage, setAddSuccessMessage] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Edit user state (admin) – only for source === 'users'
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editMiddleName, setEditMiddleName] = useState('')
  const [editEmployeeCode, setEditEmployeeCode] = useState('')
  const [editOffice, setEditOffice] = useState('')
  const [editUserLevel, setEditUserLevel] = useState('')
  const [editOfficeRepresentative, setEditOfficeRepresentative] = useState('')
  const [editVerified, setEditVerified] = useState(false)
  const [editPassword, setEditPassword] = useState('')
  const [editConfirmPassword, setEditConfirmPassword] = useState('')
  const [editError, setEditError] = useState('')
  const [editSuccessMessage, setEditSuccessMessage] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [userLevels, setUserLevels] = useState<Array<{ id: number; user_level_name: string }>>([])
  const [offices, setOffices] = useState<Array<{ id: number; office: string }>>([])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const viewerEc =
        authUser?.employeeCode?.trim() || authUser?.username?.trim() || undefined
      const response = await apiService.getUsers(viewerEc)
      if (response.success && response.data) {
        const mapped = (response.data as any[]).map((item: any) => ({
          id: item.id,
          employeeCode: item.employee_code || '',
          lastName: item.last_name || '',
          firstName: item.first_name || '',
          middleName: item.middle_name || '',
          office: item.office || '',
          userLevel: item.user_level || '',
          officeRepresentative: item.office_representative || '',
          verified: item.verified !== false,
          source: item.source,
        }))
        setUsers(mapped)
      } else {
        setError(response.error || 'Failed to load registered users')
      }
    } catch {
      setError('An error occurred while loading users')
    } finally {
      setLoading(false)
    }
  }

  // Apply dropdown filters first (office, user level, status)
  const filteredByFilters = React.useMemo(() => {
    return users.filter((item) => {
      if (filterOffice && item.office !== filterOffice) return false
      if (filterUserLevel && item.userLevel !== filterUserLevel) return false
      if (filterStatus === 'verified' && !item.verified) return false
      if (filterStatus === 'pending' && item.verified) return false
      return true
    })
  }, [users, filterOffice, filterUserLevel, filterStatus])

  // Apply sort (ASC / DESC)
  const filteredAndSorted = React.useMemo(() => {
    const list = [...filteredByFilters]
    const mult = sortOrder === 'asc' ? 1 : -1
    list.sort((a, b) => {
      let va: string | boolean = a[sortBy]
      let vb: string | boolean = b[sortBy]
      if (sortBy === 'verified') {
        va = a.verified ? '1' : '0'
        vb = b.verified ? '1' : '0'
      } else {
        va = (va ?? '') as string
        vb = (vb ?? '') as string
      }
      const cmp = String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' })
      return mult * cmp
    })
    return list
  }, [filteredByFilters, sortBy, sortOrder])

  const hasActiveFilters = !!(filterOffice || filterUserLevel || filterStatus !== 'all')

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    filteredItems,
    paginatedItems,
  } = usePagination({
    items: filteredAndSorted,
    itemsPerPage,
    searchQuery,
    searchFilter: (item, query) => {
      const q = query.toLowerCase()
      const fullName = `${item.lastName} ${item.firstName} ${item.middleName}`.toLowerCase()
      return (
        (item.employeeCode?.toLowerCase() || '').includes(q) ||
        fullName.includes(q) ||
        (item.office?.toLowerCase() || '').includes(q) ||
        (item.userLevel?.toLowerCase() || '').includes(q) ||
        (item.officeRepresentative?.toLowerCase() || '').includes(q)
      )
    },
  })

  useEffect(() => {
    fetchUsers()
  }, [authUser?.employeeCode, authUser?.username])

  // Load user levels and offices for the manual add form
  useEffect(() => {
    const load = async () => {
      const [levelRes, officeRes] = await Promise.all([
        apiService.getUserLevels(),
        apiService.getOffice(),
      ])
      if (levelRes.success && levelRes.data) {
        setUserLevels((levelRes.data as any[]).map((x: any) => ({
          id: x.id,
          user_level_name: x.user_level_name ?? x.userLevelName ?? '',
        })))
      }
      if (officeRes.success && officeRes.data) {
        setOffices((officeRes.data as any[]).map((x: any) => ({
          id: x.id,
          office: x.office ?? '',
        })))
      }
    }
    load()
  }, [])

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    setAddSuccessMessage('')

    if (addPassword !== addConfirmPassword) {
      setAddError('Passwords do not match')
      return
    }
    if (addPassword.length < 6) {
      setAddError('Password must be at least 6 characters')
      return
    }
    if (!addUserLevel.trim()) {
      setAddError('Please select a user level')
      return
    }
    if (!addFirstName.trim()) {
      setAddError('First name is required')
      return
    }
    if (!addLastName.trim()) {
      setAddError('Last name is required')
      return
    }
    if (!addEmployeeCode.trim()) {
      setAddError('Employee code is required')
      return
    }

    const middleNameForBackend = addMiddleInitial.trim() || '-'

    setIsAdding(true)
    try {
      const res = await apiService.register({
        employeeCode: addEmployeeCode.trim(),
        lastName: addLastName.trim(),
        firstName: addFirstName.trim(),
        middleName: middleNameForBackend,
        office: addOffice.trim() || undefined,
        userPassword: addPassword,
        userLevel: addUserLevel.trim(),
        officeRepresentative: addOfficeRepresentative.trim() || undefined,
      })
      if (!res.success) {
        const msg = res.error || 'Failed to create user'
        setAddError(msg)
        showError(msg)
        return
      }

      const okMsg = 'User created successfully. Approve the account to enable sign in.'
      setAddSuccessMessage(okMsg)
      showSuccess(okMsg)
      // Refresh list so the new user appears
      await fetchUsers()

      // Reset fields
      setAddPassword('')
      setAddConfirmPassword('')
      setAddFirstName('')
      setAddLastName('')
      setAddMiddleInitial('')
      setAddEmployeeCode('')
      setAddOffice('')
      setAddUserLevel('')
      setAddOfficeRepresentative('')
    } catch {
      const msg = 'An error occurred while creating the user'
      setAddError(msg)
      showError(msg)
    } finally {
      setIsAdding(false)
    }
  }

  const openEditModal = (user: RegisteredUser) => {
    if (user.source !== 'users' || !canAdmin) return
    setEditingUser(user)
    setEditFirstName(user.firstName || '')
    setEditLastName(user.lastName || '')
    setEditMiddleName(user.middleName || '')
    setEditEmployeeCode((user.employeeCode || '').slice(0, EMPLOYEE_CODE_MAX_LENGTH))
    setEditOffice(user.office || '')
    setEditUserLevel(user.userLevel || '')
    setEditOfficeRepresentative(user.officeRepresentative || '')
    setEditVerified(user.verified)
    setEditPassword('')
    setEditConfirmPassword('')
    setEditError('')
    setEditSuccessMessage('')
  }

  const closeEditModal = () => {
    setEditingUser(null)
  }

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || editingUser.source !== 'users') return
    setEditError('')
    setEditSuccessMessage('')

    if (editPassword !== editConfirmPassword) {
      setEditError('Passwords do not match')
      return
    }
    if (editPassword && editPassword.length < 6) {
      setEditError('Password must be at least 6 characters')
      return
    }
    if (!editUserLevel.trim()) {
      setEditError('Please select a user level')
      return
    }
    if (!editFirstName.trim()) {
      setEditError('First name is required')
      return
    }
    if (!editLastName.trim()) {
      setEditError('Last name is required')
      return
    }
    if (!editEmployeeCode.trim()) {
      setEditError('Employee code is required')
      return
    }

    setIsSavingEdit(true)
    try {
      const payload: Record<string, unknown> = {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        middleName: (editMiddleName.trim() || '-'),
        employeeCode: editEmployeeCode.trim(),
        office: editOffice.trim() || undefined,
        userLevel: editUserLevel.trim(),
        officeRepresentative: editOfficeRepresentative.trim() || undefined,
        verified: editVerified,
      }
      if (editPassword) payload.userPassword = editPassword

      const res = await apiService.updateUser(Number(editingUser.id), payload)
      if (!res.success) {
        const msg = res.error || 'Failed to update user'
        setEditError(msg)
        showError(msg)
        return
      }
      const okMsg = 'User updated successfully.'
      setEditSuccessMessage(okMsg)
      showSuccess(okMsg)
      await fetchUsers()
      setEditPassword('')
      setEditConfirmPassword('')
    } catch {
      setEditError('An error occurred while updating the user')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const borderColor = theme === 'dark' ? '#4a4b4c' : '#e5e7eb'
  const textPrimary = theme === 'dark' ? '#f3f4f6' : '#111827'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280'
  const panelBg = theme === 'dark' ? '#1a1a1c' : '#ffffff'
  const inputBorder = theme === 'dark' ? '#4b5563' : '#d1d5db'
  const inputBg = theme === 'dark' ? '#111827' : '#ffffff'

  const officeFilterOptions = React.useMemo(
    () =>
      Array.from(
        new Set(
          offices
            .map((o) => (o.office || '').trim())
            .filter((name) => name)
        )
      ).sort((a, b) => (a as string).localeCompare(b as string)),
    [offices]
  )
  const userLevelFilterOptions = React.useMemo(
    () =>
      Array.from(
        new Set(
          userLevels
            .map((l) => (l.user_level_name || '').trim())
            .filter((name) => name)
        )
      ).sort((a, b) => (a as string).localeCompare(b as string)),
    [userLevels]
  )

  return (
    <div className="pt-4 pb-8">
      <h1
        className={`text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
      >
        Registered Users
      </h1>
      <p className="text-xs mb-4 max-w-3xl" style={{ color: textSecondary }}>
        Pending accounts may be approved by an administrator, or by an Action Officer who is head of the office (Office Rep.: Yes) for users assigned to the same office.
        {authUser &&
          isActionOfficer(authUser) &&
          !isAdministrator(authUser) &&
          ' As an Action Officer, you only see accounts in your office.'}
      </p>

      <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium" style={{ color: textSecondary }}>
            Filters:
          </span>
          <div className="min-w-[180px]">
            <SearchableSelect
              options={[
                { id: 'all-offices', value: '', label: 'All' },
                ...officeFilterOptions.map((office, index) => ({
                  id: index,
                  value: office as string,
                  label: office as string,
                })),
              ]}
              value={filterOffice}
              onChange={(value) => {
                setFilterOffice(value)
                setCurrentPage(1)
              }}
              placeholder="All offices"
              className="text-xs"
              style={{ borderColor }}
              showSearch={true}
            />
          </div>

          <div className="min-w-[180px]">
            <SearchableSelect
              options={[
                { id: 'all-user-levels', value: '', label: 'All' },
                ...userLevelFilterOptions.map((level, index) => ({
                  id: index,
                  value: level as string,
                  label: level as string,
                })),
              ]}
              value={filterUserLevel}
              onChange={(value) => {
                setFilterUserLevel(value)
                setCurrentPage(1)
              }}
              placeholder="All user levels"
              className="text-xs"
              style={{ borderColor }}
              showSearch={false}
            />
          </div>

          <div className="min-w-[160px]">
            <SearchableSelect
              options={[
                { id: 'all-statuses', value: '', label: 'All' },
                { id: 'status-verified', value: 'verified', label: 'Verified' },
                { id: 'status-pending', value: 'pending', label: 'Pending' },
              ]}
              value={filterStatus === 'all' ? '' : filterStatus}
              onChange={(value) => {
                const next = (value || 'all') as 'all' | 'verified' | 'pending'
                setFilterStatus(next)
                setCurrentPage(1)
              }}
              placeholder="All statuses"
              className="text-xs"
              style={{ borderColor }}
              showSearch={false}
            />
          </div>

          <span className="font-medium ml-1" style={{ color: textSecondary }}>
            Sort:
          </span>
          <div className="min-w-[160px]">
            <SearchableSelect
              options={[
                { id: 'sort-lastName', value: 'lastName', label: 'Last name' },
                { id: 'sort-firstName', value: 'firstName', label: 'First name' },
                { id: 'sort-employeeCode', value: 'employeeCode', label: 'Employee code' },
                { id: 'sort-office', value: 'office', label: 'Office' },
                { id: 'sort-userLevel', value: 'userLevel', label: 'User level' },
                { id: 'sort-verified', value: 'verified', label: 'Status' },
              ]}
              value={sortBy}
              onChange={(value) => {
                setSortBy((value || 'lastName') as typeof sortBy)
                setCurrentPage(1)
              }}
              placeholder="Sort by"
              className="text-xs"
              style={{ borderColor }}
              showSearch={false}
            />
          </div>
          <div className="flex rounded border overflow-hidden" style={{ borderColor: borderColor }}>
            <button
              type="button"
              title="Ascending (A→Z)"
              onClick={() => {
                setSortOrder('asc')
                setCurrentPage(1)
              }}
              className="px-2 py-1 text-xs font-medium"
              style={{
                backgroundColor: sortOrder === 'asc' ? (theme === 'dark' ? '#374151' : '#e5e7eb') : inputBg,
                color: sortOrder === 'asc' ? textPrimary : textSecondary,
              }}
            >
              ASC
            </button>
            <button
              type="button"
              title="Descending (Z→A)"
              onClick={() => {
                setSortOrder('desc')
                setCurrentPage(1)
              }}
              className="px-2 py-1 text-xs font-medium border-l"
              style={{
                borderColor: borderColor,
                backgroundColor: sortOrder === 'desc' ? (theme === 'dark' ? '#374151' : '#e5e7eb') : inputBg,
                color: sortOrder === 'desc' ? textPrimary : textSecondary,
              }}
            >
              DESC
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search users..."
            className="w-56"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            icon={
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            iconPosition="left"
          />

          {canAdmin && (
            <button
              type="button"
              onClick={() => {
                setShowAddModal(true)
                setAddError('')
                setAddSuccessMessage('')
              }}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: '#4b8b3b' }}
            >
              Add user
            </button>
          )}
        </div>
      </div>

      <hr
        className="mb-6"
        style={{ borderColor }}
      />

      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-sm"
          style={{ backgroundColor: theme === 'dark' ? '#3f1d1d' : '#fef2f2', color: '#dc2626' }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: panelBg, borderColor }}
      >
        {loading ? (
          <div className="px-6 py-12 text-center" style={{ color: textSecondary }}>
            Loading registered users...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="px-6 py-12 text-center" style={{ color: textSecondary }}>
            No registered users found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      Employee Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      Last Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      First Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      Middle Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      Office
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      User Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      Office Rep.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((user, index) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: `1px solid ${borderColor}`,
                        backgroundColor: index % 2 === 1 && theme === 'dark' ? 'rgba(255,255,255,0.02)' : undefined,
                      }}
                    >
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: textPrimary }}>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: textPrimary }}>
                        {user.employeeCode || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: textPrimary }}>
                        {user.lastName || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: textPrimary }}>
                        {user.firstName || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: textPrimary }}>
                        {user.middleName || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: textPrimary }}>
                        {user.office || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: textPrimary }}>
                        {user.userLevel || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: textPrimary }}>
                        {user.officeRepresentative || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span
                          className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: user.verified ? (theme === 'dark' ? '#065f46' : '#d1fae5') : (theme === 'dark' ? '#78350f' : '#fef3c7'),
                            color: user.verified ? (theme === 'dark' ? '#6ee7b7' : '#065f46') : (theme === 'dark' ? '#fcd34d' : '#92400e'),
                          }}
                        >
                          {user.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {user.source === 'users' && canAdmin && (
                            <button
                              type="button"
                              title="Edit user"
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded border inline-flex items-center justify-center disabled:opacity-50 bg-[#3ecf8e] text-white border-[#3ecf8e] hover:brightness-95 active:brightness-90 shadow-sm"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          )}
                          {user.source === 'users' &&
                            !user.verified &&
                            authUser &&
                            canVerifyRegisteredUser(authUser, user) && (
                            <button
                              type="button"
                              title="Approve user"
                              disabled={approvingId === user.id}
                              onClick={async () => {
                                setApprovingId(Number(user.id))
                                try {
                                  const res = await apiService.updateUser(
                                    Number(user.id),
                                    { verified: true },
                                    actingUserOpts
                                  )
                                  if (res.success) {
                                    showSuccess('User approved')
                                    await fetchUsers()
                                  } else {
                                    showError(res.error || 'Could not approve user')
                                  }
                                } finally {
                                  setApprovingId(null)
                                }
                              }}
                              className="p-1.5 rounded border inline-flex items-center justify-center disabled:opacity-50 bg-[#3ecf8e] text-white border-[#3ecf8e] hover:brightness-95 active:brightness-90 shadow-sm"
                            >
                              {approvingId === user.id ? (
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredItems.length > 0 && (
              <div
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                style={{ borderTop: `1px solid ${borderColor}` }}
              >
                <span className="text-xs" style={{ color: textSecondary }}>
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} users
                </span>
                <PageSizeSelect value={itemsPerPage} onChange={setItemsPerPage} />
                <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                      className="px-2 py-1 text-xs rounded border disabled:opacity-50"
                      style={{ borderColor, color: textPrimary }}
                    >
                      Previous
                    </button>
                    <span className="px-2 py-1 text-xs" style={{ color: textSecondary }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-2 py-1 text-xs rounded border disabled:opacity-50"
                      style={{ borderColor, color: textPrimary }}
                    >
                      Next
                    </button>
                  </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (() => {
        const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
        const modalBorderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
        const modalTextPrimary = theme === 'dark' ? '#fafafa' : '#171717'
        const modalTextSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'
        const modalInputBg = theme === 'dark' ? '#171717' : '#ffffff'
        const modalInputBorder = theme === 'dark' ? '#262626' : '#e5e5e5'
        return (
          <div
            className="fixed inset-0 flex items-center justify-center z-[9999]"
            onClick={() => setShowAddModal(false)}
            style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
          >
            <div
              className="rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
              style={{ backgroundColor: modalBg, border: `1px solid ${modalBorderColor}` }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5" style={{ borderBottom: `1px solid ${modalBorderColor}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold mb-1" style={{ color: modalTextPrimary }}>
                      Add user (manual)
                    </h2>
                    <p className="text-xs" style={{ color: modalTextSecondary }}>
                      This will create a new account in the registered users list. An administrator or the office head (Action Officer, Office Rep.: Yes) for that office must approve the account before the user can sign in.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-lg leading-none transition-colors"
                    style={{ color: modalTextSecondary }}
                    onClick={() => setShowAddModal(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#f5f5f5'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddUserSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {addError && (
                    <div className="mb-4 text-xs px-3 py-2 rounded-md border border-red-500 bg-red-500/10" style={{ color: '#ef4444' }}>
                      {addError}
                    </div>
                  )}
                  {addSuccessMessage && (
                    <div className="mb-4 text-xs px-3 py-2 rounded-md border border-green-500 bg-green-500/10" style={{ color: '#22c55e' }}>
                      {addSuccessMessage}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium whitespace-nowrap" style={{ color: modalTextPrimary, width: '200px' }}>
                        First name <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={addFirstName}
                          onChange={(e) => setAddFirstName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                          style={{ backgroundColor: modalInputBg, border: `1px solid ${modalInputBorder}`, color: modalTextPrimary }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium whitespace-nowrap" style={{ color: modalTextPrimary, width: '200px' }}>
                        Last name <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={addLastName}
                          onChange={(e) => setAddLastName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                          style={{ backgroundColor: modalInputBg, border: `1px solid ${modalInputBorder}`, color: modalTextPrimary }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium whitespace-nowrap" style={{ color: modalTextPrimary, width: '200px' }}>
                        Middle initial
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={addMiddleInitial}
                          onChange={(e) => setAddMiddleInitial(e.target.value.slice(0, 5))}
                          maxLength={5}
                          className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                          style={{ backgroundColor: modalInputBg, border: `1px solid ${modalInputBorder}`, color: modalTextPrimary }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium whitespace-nowrap" style={{ color: modalTextPrimary, width: '200px' }}>
                        Employee code <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={addEmployeeCode}
                          onChange={(e) => setAddEmployeeCode(e.target.value.slice(0, EMPLOYEE_CODE_MAX_LENGTH))}
                          maxLength={EMPLOYEE_CODE_MAX_LENGTH}
                          className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                          style={{ backgroundColor: modalInputBg, border: `1px solid ${modalInputBorder}`, color: modalTextPrimary }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium whitespace-nowrap" style={{ color: modalTextPrimary, width: '200px' }}>
                        Office
                      </label>
                      <div className="flex-1">
                        <select
                          value={addOffice}
                          onChange={(e) => setAddOffice(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                          style={{ backgroundColor: modalInputBg, border: `1px solid ${modalInputBorder}`, color: modalTextPrimary }}
                        >
                          <option value="">Select office (optional)</option>
                          {offices.map((o) => (
                            <option key={o.id} value={o.office}>
                              {o.office}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium whitespace-nowrap" style={{ color: modalTextPrimary, width: '200px' }}>
                        User level <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>
                      </label>
                      <div className="flex-1">
                        <select
                          value={addUserLevel}
                          onChange={(e) => setAddUserLevel(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                          style={{ backgroundColor: modalInputBg, border: `1px solid ${modalInputBorder}`, color: modalTextPrimary }}
                        >
                          <option value="">Select user level</option>
                          {userLevels.map((l) => (
                            <option key={l.id} value={l.user_level_name}>
                              {l.user_level_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium whitespace-nowrap" style={{ color: modalTextPrimary, width: '200px' }}>
                        Office representative
                      </label>
                      <div className="flex-1 flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="addOfficeRepresentative"
                            value="Yes"
                            checked={addOfficeRepresentative === 'Yes'}
                            onChange={() => setAddOfficeRepresentative('Yes')}
                            className="w-4 h-4"
                            style={{ accentColor: '#3ecf8e' }}
                          />
                          <span className="text-xs" style={{ color: modalTextPrimary }}>Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="addOfficeRepresentative"
                            value="No"
                            checked={addOfficeRepresentative === 'No'}
                            onChange={() => setAddOfficeRepresentative('No')}
                            className="w-4 h-4"
                            style={{ accentColor: '#3ecf8e' }}
                          />
                          <span className="text-xs" style={{ color: modalTextPrimary }}>No</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium whitespace-nowrap" style={{ color: modalTextPrimary, width: '200px' }}>
                        Password <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="password"
                          value={addPassword}
                          onChange={(e) => setAddPassword(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                          style={{ backgroundColor: modalInputBg, border: `1px solid ${modalInputBorder}`, color: modalTextPrimary }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium whitespace-nowrap" style={{ color: modalTextPrimary, width: '200px' }}>
                        Confirm password <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="password"
                          value={addConfirmPassword}
                          onChange={(e) => setAddConfirmPassword(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                          style={{ backgroundColor: modalInputBg, border: `1px solid ${modalInputBorder}`, color: modalTextPrimary }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="px-6 py-4 flex justify-end gap-2"
                  style={{ borderTop: `1px solid ${modalBorderColor}`, backgroundColor: modalBg }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                    style={{ color: modalTextSecondary, backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#f5f5f5' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="px-3 py-1.5 text-xs font-medium rounded-md text-white transition-colors"
                    style={{ backgroundColor: '#3ecf8e', opacity: isAdding ? 0.7 : 1 }}
                    onMouseEnter={(e) => { if (!isAdding) e.currentTarget.style.backgroundColor = '#36b37e' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3ecf8e' }}
                  >
                    {isAdding ? 'Saving...' : 'Save user'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      })()}

      {editingUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div
            className="w-full max-w-xl rounded-lg shadow-lg p-5"
            style={{ backgroundColor: panelBg, color: textPrimary }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Edit user</h2>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded border"
                style={{ borderColor: borderColor, color: textSecondary }}
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>

            {editError && (
              <div className="mb-2 text-xs px-2 py-1 rounded border border-red-500 text-red-600 bg-red-50">
                {editError}
              </div>
            )}

            {editSuccessMessage && (
              <div className="mb-2 text-xs px-2 py-1 rounded border border-green-500 text-green-700 bg-green-50">
                {editSuccessMessage}
              </div>
            )}

            <form onSubmit={handleEditUserSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block mb-1" style={{ color: textSecondary }}>
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-2 py-1 rounded border"
                    style={{ borderColor: inputBorder, backgroundColor: inputBg, color: textPrimary }}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block mb-1" style={{ color: textSecondary }}>
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-2 py-1 rounded border"
                    style={{ borderColor: inputBorder, backgroundColor: inputBg, color: textPrimary }}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block mb-1" style={{ color: textSecondary }}>
                    Middle name
                  </label>
                  <input
                    type="text"
                    value={editMiddleName}
                    onChange={(e) => setEditMiddleName(e.target.value)}
                    className="w-full px-2 py-1 rounded border"
                    style={{ borderColor: inputBorder, backgroundColor: inputBg, color: textPrimary }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1" style={{ color: textSecondary }}>
                    Employee code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editEmployeeCode}
                    onChange={(e) => setEditEmployeeCode(e.target.value.slice(0, EMPLOYEE_CODE_MAX_LENGTH))}
                    maxLength={EMPLOYEE_CODE_MAX_LENGTH}
                    className="w-full px-2 py-1 rounded border"
                    style={{ borderColor: inputBorder, backgroundColor: inputBg, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block mb-1" style={{ color: textSecondary }}>
                    Office
                  </label>
                  <select
                    value={editOffice}
                    onChange={(e) => setEditOffice(e.target.value)}
                    className="w-full px-2 py-1 rounded border"
                    style={{ borderColor: inputBorder, backgroundColor: inputBg, color: textPrimary }}
                  >
                    <option value="">Select office (optional)</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.office}>
                        {o.office}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1" style={{ color: textSecondary }}>
                    User level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editUserLevel}
                    onChange={(e) => setEditUserLevel(e.target.value)}
                    className="w-full px-2 py-1 rounded border"
                    style={{ borderColor: inputBorder, backgroundColor: inputBg, color: textPrimary }}
                  >
                    <option value="">Select user level</option>
                    {userLevels.map((l) => (
                      <option key={l.id} value={l.user_level_name}>
                        {l.user_level_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="block mb-1" style={{ color: textSecondary }}>
                    Office representative
                  </span>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="editOfficeRepresentative"
                        value="Yes"
                        checked={editOfficeRepresentative === 'Yes'}
                        onChange={() => setEditOfficeRepresentative('Yes')}
                        className="h-3 w-3"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="editOfficeRepresentative"
                        value="No"
                        checked={editOfficeRepresentative === 'No'}
                        onChange={() => setEditOfficeRepresentative('No')}
                        className="h-3 w-3"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editVerified"
                  checked={editVerified}
                  onChange={(e) => setEditVerified(e.target.checked)}
                  className="h-3 w-3 rounded border-gray-300"
                />
                <label htmlFor="editVerified" className="cursor-pointer" style={{ color: textSecondary }}>
                  Verified (user can sign in)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1" style={{ color: textSecondary }}>
                    New password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-2 py-1 rounded border"
                    style={{ borderColor: inputBorder, backgroundColor: inputBg, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block mb-1" style={{ color: textSecondary }}>
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-2 py-1 rounded border"
                    style={{ borderColor: inputBorder, backgroundColor: inputBg, color: textPrimary }}
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded border text-xs"
                  style={{ borderColor: borderColor, color: textSecondary }}
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-3 py-1 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: '#2563eb', opacity: isSavingEdit ? 0.7 : 1 }}
                >
                  {isSavingEdit ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegisteredUsers
