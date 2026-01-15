import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Pagination from '../../components/Pagination'
import Input from '../../components/Input'
import Table from '../../components/Table'
import Button from '../../components/Button'
import ActionTakenModal from '../../components/reference-tables/ActionTakenModal'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import { apiService } from '../../services/api'
import { usePagination } from '../../hooks/usePagination'

interface ActionTakenItem {
  id: number
  actionTaken: string
}

const ActionTaken: React.FC = () => {
  const { theme } = useTheme()
  const [items, setItems] = useState<ActionTakenItem[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteItemName, setDeleteItemName] = useState<string>('')
  const [editingItem, setEditingItem] = useState<ActionTakenItem | null>(null)
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
      const actionTaken = item.actionTaken?.toLowerCase() || ''
      return idString.includes(searchLower) || actionTaken.includes(searchLower)
    }
  })

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getActionTaken()
      if (response.success && response.data) {
        // Map database snake_case to frontend camelCase
        const mappedItems = response.data.map((item: any) => ({
          id: item.id,
          actionTaken: item.action_taken || ''
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
      const response = await apiService.bulkDeleteActionTaken(selectedItems)
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

  const handleEdit = (item: ActionTakenItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleSave = async (data: { actionTaken: string }) => {
    setLoading(true)
    setError(null)
    try {
      if (editingItem) {
        // Update existing item
        const response = await apiService.updateActionTaken(editingItem.id, data)
        if (response.success && response.data) {
          // Map database response to frontend format
          const updatedItem = {
            id: response.data.id,
            actionTaken: response.data.action_taken || data.actionTaken
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
        const response = await apiService.createActionTaken(data)
        if (response.success && response.data) {
          // Map database response to frontend format
          const newItem = {
            id: response.data.id,
            actionTaken: response.data.action_taken || data.actionTaken
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

  const handleDelete = (item: ActionTakenItem) => {
    setDeleteType('single')
    setDeleteId(item.id)
    setDeleteItemName(item.actionTaken)
    setIsDeleteModalOpen(true)
  }

  const confirmSingleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.deleteActionTaken(deleteId)
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
  
  const RequiredAsterisk = () => <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>

  return (
    <div className="pt-4 pb-8">
      <h1 className={`text-2xl font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>Action Taken</h1>
      
      {error && (
        <div className={`mb-4 p-3 rounded-md ${
          theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800'
        }`}>
          {error}
        </div>
      )}
      
      <div className="flex justify-end items-center gap-3 mb-3">
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
      
      <hr 
        className={`mb-4 ${theme === 'dark' ? '' : 'border-gray-300'}`}
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
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
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
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Action Taken ID <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Action Taken <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
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
              <td colSpan={4} className={`px-4 py-4 text-center text-sm ${
                theme === 'dark' ? 'text-white' : 'text-gray-500'
              }`}>
                Loading...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={4} className={`px-4 py-4 text-center text-sm ${
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
                  {String(item.id).padStart(5, '0')}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.actionTaken}
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

      <ActionTakenModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSave}
        initialData={editingItem ? { id: editingItem.id, action_taken: editingItem.actionTaken } : null}
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

export default ActionTaken
