import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'
import Pagination from '../../components/Pagination'
import Input from '../../components/Input'
import Table from '../../components/Table'
import Button from '../../components/Button'
import ActionOfficerModal from '../../components/reference-tables/ActionOfficerModal'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import { apiService } from '../../services/api'
import { DELETE_ROW_ACTION_BUTTON_CLASS } from '../../constants/deleteActionStyles'
import { usePagination } from '../../hooks/usePagination'

interface ActionOfficerItem {
  id: number | string
  employeeCode: string
  lastName: string
  firstName: string
  middleName: string
  office: string
  userPassword?: string
  userLevel: string
  officeRepresentative: string
  source?: 'users' | 'profiles'
}

const ActionOfficer: React.FC = () => {
  const { theme } = useTheme()
  const [items, setItems] = useState<ActionOfficerItem[]>([])
  const [selectedItems, setSelectedItems] = useState<(number | string)[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single')
  const [deleteId, setDeleteId] = useState<number | string | null>(null)
  const [deleteItem, setDeleteItem] = useState<ActionOfficerItem | null>(null)
  const [deleteItemName, setDeleteItemName] = useState<string>('')
  const [editingItem, setEditingItem] = useState<ActionOfficerItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null)
  const [tooltipMounted, setTooltipMounted] = useState(false)

  const baseActionButtonClasses =
    'inline-flex items-center justify-center h-7 w-8 rounded-lg border transition-colors'

  useEffect(() => {
    setTooltipMounted(true)
  }, [])

  const hideTooltip = () => {
    setTooltip(null)
    setTooltipPos(null)
  }

  const showTooltip = (label: string, el: HTMLElement) => {
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

  // Fetch items from API on component mount
  useEffect(() => {
    fetchItems()
  }, [])

  // Use pagination hook
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    filteredItems,
    paginatedItems
  } = usePagination({
    items,
    itemsPerPage: 20,
    searchQuery,
    searchFilter: (item, query) => {
      const searchLower = query.toLowerCase()
      const idString = String(item.id).padStart(5, '0')
      const employeeCode = item.employeeCode?.toLowerCase() || ''
      const lastName = item.lastName?.toLowerCase() || ''
      const firstName = item.firstName?.toLowerCase() || ''
      const middleName = item.middleName?.toLowerCase() || ''
      const office = item.office?.toLowerCase() || ''
      const userLevel = item.userLevel?.toLowerCase() || ''
      const officeRepresentative = item.officeRepresentative?.toLowerCase() || ''
      
      return idString.includes(searchLower) ||
             employeeCode.includes(searchLower) ||
             lastName.includes(searchLower) ||
             firstName.includes(searchLower) ||
             middleName.includes(searchLower) ||
             office.includes(searchLower) ||
             userLevel.includes(searchLower) ||
             officeRepresentative.includes(searchLower)
    }
  })

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getUsers()
      if (response.success && response.data) {
        const raw = Array.isArray(response.data) ? response.data : []
        // Show only users whose User Level is Action Officer (or Action Officers)
        const actionOfficerLevel = (level: string) => {
          const l = (level || '').toLowerCase()
          return l === 'action officer' || l === 'action officers' || l.includes('action officer')
        }
        const mappedItems: ActionOfficerItem[] = raw
          .filter((item: any) => actionOfficerLevel(item.user_level || item.userLevel || ''))
          .map((item: any) => ({
            id: item.id,
            employeeCode: item.employee_code || '',
            lastName: item.last_name || '',
            firstName: item.first_name || '',
            middleName: item.middle_name || '',
            office: item.office || '',
            userLevel: item.user_level || '',
            officeRepresentative: item.office_representative || '',
            source: item.source,
          }))
        setItems(mappedItems)
      } else {
        setError(response.error || 'Failed to fetch items')
      }
    } catch (err) {
      setError('An error occurred while fetching items')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(paginatedItems.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: number | string) => {
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

  const confirmBulkDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      const toRemove = items.filter(item => selectedItems.includes(item.id) && item.source === 'users' && typeof item.id === 'number')
      for (const item of toRemove) {
        await apiService.updateUser(item.id as number, { userLevel: 'End-User' })
      }
      await fetchItems()
      setSelectedItems([])
    } catch (err) {
      setError('An error occurred while removing items')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: ActionOfficerItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleSave = async (data: {
    employeeCode: string
    lastName: string
    firstName: string
    middleName: string
    office: string
    userPassword: string
    userLevel: string
    officeRepresentative: string
  }) => {
    if (!editingItem) return
    if (editingItem.source !== 'users' || typeof editingItem.id !== 'number') {
      setError('This user can only be edited from Registered Users.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        employeeCode: data.employeeCode,
        office: data.office,
        userLevel: data.userLevel,
        officeRepresentative: data.officeRepresentative,
      }
      if (data.userPassword?.trim()) payload.userPassword = data.userPassword
      const response = await apiService.updateUser(editingItem.id, payload)
      if (response.success) {
        await fetchItems()
        setIsModalOpen(false)
        setEditingItem(null)
      } else {
        setError(response.error || 'Failed to update item')
      }
    } catch (err) {
      setError('An error occurred while saving')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (item: ActionOfficerItem) => {
    setDeleteType('single')
    setDeleteId(item.id)
    setDeleteItem(item)
    setDeleteItemName(`${item.firstName} ${item.lastName} (${item.employeeCode})`)
    setIsDeleteModalOpen(true)
  }

  const confirmSingleDelete = async () => {
    if (!deleteId || !deleteItem) return
    if (deleteItem.source !== 'users' || typeof deleteItem.id !== 'number') {
      setError('This user can only be managed from Registered Users.')
      setDeleteId(null)
      setDeleteItem(null)
      setDeleteItemName('')
      setIsDeleteModalOpen(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.updateUser(deleteItem.id, { userLevel: 'End-User' })
      if (response.success) {
        await fetchItems()
      } else {
        setError(response.error || 'Failed to remove item')
      }
    } catch (err) {
      setError('An error occurred while removing item')
    } finally {
      setLoading(false)
      setDeleteId(null)
      setDeleteItem(null)
      setDeleteItemName('')
      setIsDeleteModalOpen(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Action Officer - Reference Table</title>
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
          <h1>Action Officer - Reference Table</h1>
          <table>
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Office</th>
                <th>User Level</th>
                <th>Office Representative</th>
              </tr>
            </thead>
            <tbody>
              ${filteredItems.length === 0
                ? '<tr><td colspan="7" class="no-data">No items found</td></tr>'
                : filteredItems.map(item => `
                  <tr>
                    <td>${item.employeeCode || '—'}</td>
                    <td>${item.lastName || '—'}</td>
                    <td>${item.firstName || '—'}</td>
                    <td>${item.middleName || '—'}</td>
                    <td>${item.office || '—'}</td>
                    <td>${item.userLevel || '—'}</td>
                    <td>${item.officeRepresentative || '—'}</td>
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
    const headers = ['Employee Code', 'Last Name', 'First Name', 'Middle Name', 'Office', 'User Level', 'Office Representative']
    const csvRows = [headers.join(',')]

    filteredItems.forEach(item => {
      const row = [
        `\"${(item.employeeCode || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(item.lastName || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(item.firstName || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(item.middleName || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(item.office || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(item.userLevel || '').replace(/\"/g, '\"\"')}\"`,
        `\"${(item.officeRepresentative || '').replace(/\"/g, '\"\"')}\"`
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `action_officer_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const RequiredAsterisk = () => <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>

  const tooltipEl =
    tooltipMounted &&
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
    <div className="pt-4 pb-8">
      <h1 className={`text-2xl font-semibold mb-1 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>Action Officer</h1>
      {error && (
        <div className={`mb-4 p-3 rounded-md ${
          theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800'
        }`}>
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredItems.length}
            itemsPerPage={20}
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
            onClick={handleDeleteSelected}
            disabled={selectedItems.length === 0 || loading}
            variant="danger"
          >
            Delete {selectedItems.length > 0 && `(${selectedItems.length})`}
          </Button>
          <Input
            type="text"
            placeholder="Search..."
            className="w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            totalItems={filteredItems.length}
            itemsPerPage={20}
          />
        }
      >
        <thead className={theme === 'dark' ? 'bg-dark-hover/60' : 'bg-gray-50'}>
          <tr>
            <th className={`px-4 py-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {paginatedItems.length > 0 && (
                <input
                  type="checkbox"
                  checked={paginatedItems.length > 0 && paginatedItems.every(item => selectedItems.includes(item.id))}
                  onChange={handleSelectAll}
                  className={`rounded text-green-600 focus:ring-green-500 ${
                    theme === 'dark' ? 'bg-dark-panel' : 'border-gray-300'
                  }`}
                  style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
                />
              )}
            </th>
            <th className={`px-4 py-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Employee Code <RequiredAsterisk />
            </th>
            <th className={`px-4 py-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Last Name <RequiredAsterisk />
            </th>
            <th className={`px-4 py-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              First Name <RequiredAsterisk />
            </th>
            <th className={`px-4 py-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Middle Name <RequiredAsterisk />
            </th>
            <th className={`px-4 py-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Office
            </th>
            <th className={`px-4 py-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              User Level <RequiredAsterisk />
            </th>
            <th className={`px-4 py-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Office Representative
            </th>
            <th className={`px-4 py-2 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${
          theme === 'dark' ? 'bg-dark-panel divide-dark-hover' : 'bg-white divide-gray-200'
        }`}>
          {loading && items.length === 0 ? (
            <tr>
              <td colSpan={9} className={`px-4 py-2 text-center text-xs ${
                theme === 'dark' ? 'text-white' : 'text-gray-500'
              }`}>
                Loading...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={9} className={`px-4 py-2 text-center text-xs ${
                theme === 'dark' ? 'text-white' : 'text-gray-500'
              }`}>
                No items found
              </td>
            </tr>
          ) : (
            paginatedItems.map((item) => {
              const isSelected = selectedItems.includes(item.id)
              return (
              <tr 
                key={item.id} 
                className={`transition-colors ${
                  isSelected
                    ? theme === 'dark' 
                      ? 'bg-blue-900/30 hover:bg-blue-900/40' 
                      : 'bg-blue-100 hover:bg-blue-200'
                    : theme === 'dark' 
                      ? 'hover:bg-dark-hover' 
                      : 'hover:bg-gray-50'
                }`}
              >
                <td className={`px-4 py-2 whitespace-nowrap text-xs font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className={`rounded text-green-600 focus:ring-green-500 ${
                      theme === 'dark' ? 'bg-dark-panel' : 'border-gray-300'
                    }`}
                    style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
                  />
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.employeeCode}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.lastName}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.firstName}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.middleName}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.office}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.userLevel}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-xs text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.officeRepresentative}
                </td>
                <td
                  className="px-4 py-2 whitespace-nowrap text-xs font-medium text-left"
                  onMouseLeave={hideTooltip}
                  onPointerLeave={hideTooltip}
                >
                  {item.source === 'users' ? (
                    <div className="flex items-center gap-1">
                      <TooltipLabel label="Edit">
                        <button
                          onClick={() => {
                            hideTooltip()
                            handleEdit(item)
                          }}
                        className={`${baseActionButtonClasses} ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-100 bg-gray-900 hover:bg-gray-800'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </TooltipLabel>
                      <TooltipLabel label="Delete">
                        <button
                          onClick={() => {
                            hideTooltip()
                            handleDelete(item)
                          }}
                          className={DELETE_ROW_ACTION_BUTTON_CLASS}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </TooltipLabel>
                    </div>
                  ) : (
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>—</span>
                  )}
                </td>
              </tr>
              )
            })
          )}
        </tbody>
      </Table>

      <ActionOfficerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSave}
        initialData={editingItem ? {
          id: Number(editingItem.id),
          employeeCode: editingItem.employeeCode,
          lastName: editingItem.lastName,
          firstName: editingItem.firstName,
          middleName: editingItem.middleName,
          office: editingItem.office,
          userPassword: editingItem.userPassword ?? '',
          userLevel: editingItem.userLevel,
          officeRepresentative: editingItem.officeRepresentative,
        } : null}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteId(null)
          setDeleteItem(null)
          setDeleteItemName('')
        }}
        onConfirm={deleteType === 'bulk' ? confirmBulkDelete : confirmSingleDelete}
        message={deleteType === 'bulk' ? 'Selected users will no longer be Action Officers (their User Level will be set to End-User).' : 'This user will no longer be an Action Officer (User Level will be set to End-User).'}
        itemName={deleteItemName}
        isBulk={deleteType === 'bulk'}
        count={selectedItems.length}
      />
      {tooltipEl}
    </div>
  )
}

export default ActionOfficer
