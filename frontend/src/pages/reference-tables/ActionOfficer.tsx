import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Pagination from '../../components/Pagination'
import Input from '../../components/Input'
import Table from '../../components/Table'
import Button from '../../components/Button'
import ActionOfficerModal from '../../components/reference-tables/ActionOfficerModal'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import { apiService } from '../../services/api'
import { usePagination } from '../../hooks/usePagination'

interface ActionOfficerItem {
  id: number
  employeeCode: string
  lastName: string
  firstName: string
  middleName: string
  office: string
  userPassword: string
  userLevel: string
  officeRepresentative: string
}

const ActionOfficer: React.FC = () => {
  const { theme } = useTheme()
  const [items, setItems] = useState<ActionOfficerItem[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteItemName, setDeleteItemName] = useState<string>('')
  const [editingItem, setEditingItem] = useState<ActionOfficerItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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
      const response = await apiService.getActionOfficer()
      if (response.success && response.data) {
        // Map database snake_case to frontend camelCase
        const mappedItems = response.data.map((item: any) => ({
          id: item.id,
          employeeCode: item.employee_code || '',
          lastName: item.last_name || '',
          firstName: item.first_name || '',
          middleName: item.middle_name || '',
          office: item.office || '',
          userPassword: item.user_password || '',
          userLevel: item.user_level || '',
          officeRepresentative: item.office_representative || ''
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

  const handleSelectItem = (id: number) => {
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
      const response = await apiService.bulkDeleteActionOfficer(selectedItems)
      if (response.success) {
        setItems(prev => prev.filter(item => !selectedItems.includes(item.id)))
        setSelectedItems([])
      } else {
        setError(response.error || 'Failed to delete items')
      }
    } catch (err) {
      setError('An error occurred while deleting items')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
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
    setLoading(true)
    setError(null)
    try {
      if (editingItem) {
        // Update existing item
        const response = await apiService.updateActionOfficer(editingItem.id, data)
        if (response.success && response.data) {
          // Map database response to frontend format
          const updatedItem = {
            id: response.data.id,
            employeeCode: response.data.employee_code || data.employeeCode,
            lastName: response.data.last_name || data.lastName,
            firstName: response.data.first_name || data.firstName,
            middleName: response.data.middle_name || data.middleName,
            office: response.data.office || data.office,
            userPassword: response.data.user_password || data.userPassword,
            userLevel: response.data.user_level || data.userLevel,
            officeRepresentative: response.data.office_representative || data.officeRepresentative
          }
          setItems(prev => prev.map(item => 
            item.id === editingItem.id ? updatedItem : item
          ))
          setIsModalOpen(false)
          setEditingItem(null)
        } else {
          setError(response.error || 'Failed to update item')
        }
      } else {
        // Add new item
        const response = await apiService.createActionOfficer(data)
        if (response.success && response.data) {
          // Map database response to frontend format
          const newItem = {
            id: response.data.id,
            employeeCode: response.data.employee_code || data.employeeCode,
            lastName: response.data.last_name || data.lastName,
            firstName: response.data.first_name || data.firstName,
            middleName: response.data.middle_name || data.middleName,
            office: response.data.office || data.office,
            userPassword: response.data.user_password || data.userPassword,
            userLevel: response.data.user_level || data.userLevel,
            officeRepresentative: response.data.office_representative || data.officeRepresentative
          }
          setItems(prev => [...prev, newItem])
          setIsModalOpen(false)
          setEditingItem(null)
        } else {
          setError(response.error || 'Failed to create item')
        }
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
    setDeleteItemName(`${item.firstName} ${item.lastName} (${item.employeeCode})`)
    setIsDeleteModalOpen(true)
  }

  const confirmSingleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.deleteActionOfficer(deleteId)
      if (response.success) {
        setItems(prev => prev.filter(item => item.id !== deleteId))
      } else {
        setError(response.error || 'Failed to delete item')
      }
    } catch (err) {
      setError('An error occurred while deleting item')
    } finally {
      setLoading(false)
      setDeleteId(null)
      setDeleteItemName('')
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
                <th>ID</th>
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
                ? '<tr><td colspan="8" class="no-data">No items found</td></tr>'
                : filteredItems.map(item => `
                  <tr>
                    <td>${String(item.id).padStart(5, '0')}</td>
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
    const headers = ['ID', 'Employee Code', 'Last Name', 'First Name', 'Middle Name', 'Office', 'User Level', 'Office Representative']
    const csvRows = [headers.join(',')]

    filteredItems.forEach(item => {
      const row = [
        `\"${String(item.id).padStart(5, '0').replace(/\"/g, '\"\"')}\"`,
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

  return (
    <div className="pt-4 pb-8">
      <h1 className={`text-2xl font-semibold mb-4 ${
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
          <Button
            onClick={handleAdd}
            disabled={loading}
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
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
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
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              ID
            </th>
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Employee Code <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Last Name <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              First Name <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Middle Name <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Office
            </th>
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              User Password <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              User Level <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Office Representative
            </th>
            <th className={`px-6 py-4 whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider ${
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
              <td colSpan={11} className={`px-4 py-4 text-center text-sm ${
                theme === 'dark' ? 'text-white' : 'text-gray-500'
              }`}>
                Loading...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={11} className={`px-4 py-4 text-center text-sm ${
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
                <td className={`px-6 py-2 whitespace-nowrap text-sm font-medium ${
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
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.id}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.employeeCode}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.lastName}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.firstName}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.middleName}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.office}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ••••••••
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.userLevel}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.officeRepresentative}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-left">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className={`p-1.5 rounded transition-colors ${
                        theme === 'dark'
                          ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className={`p-1.5 rounded transition-colors ${
                        theme === 'dark'
                          ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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
        initialData={editingItem}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteId(null)
          setDeleteItemName('')
        }}
        onConfirm={deleteType === 'bulk' ? confirmBulkDelete : confirmSingleDelete}
        message={deleteType === 'bulk' ? 'This will permanently delete all selected items.' : 'This will permanently delete this item.'}
        itemName={deleteItemName}
        isBulk={deleteType === 'bulk'}
        count={selectedItems.length}
      />
    </div>
  )
}

export default ActionOfficer
