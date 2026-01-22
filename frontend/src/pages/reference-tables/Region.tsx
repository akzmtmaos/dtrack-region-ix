import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Pagination from '../../components/Pagination'
import Input from '../../components/Input'
import Table from '../../components/Table'
import Button from '../../components/Button'
import RegionModal from '../../components/reference-tables/RegionModal'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'
import { apiService } from '../../services/api'
import { usePagination } from '../../hooks/usePagination'

interface RegionItem {
  id: number
  region_name: string
  nscb_code: string
  nscb_name: string
  added_by: string
  status: string
  date_updated?: string
}

const Region: React.FC = () => {
  const { theme } = useTheme()
  const [items, setItems] = useState<RegionItem[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteItemName, setDeleteItemName] = useState<string>('')
  const [editingItem, setEditingItem] = useState<RegionItem | null>(null)
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
      const regionName = item.region_name?.toLowerCase() || ''
      const nscbCode = item.nscb_code?.toLowerCase() || ''
      const nscbName = item.nscb_name?.toLowerCase() || ''
      const addedBy = item.added_by?.toLowerCase() || ''
      const status = item.status?.toLowerCase() || ''
      
      return idString.includes(searchLower) ||
             regionName.includes(searchLower) ||
             nscbCode.includes(searchLower) ||
             nscbName.includes(searchLower) ||
             addedBy.includes(searchLower) ||
             status.includes(searchLower)
    }
  })

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getRegion()
      if (response.success && response.data) {
        // Map database snake_case to frontend format
        const mappedItems = response.data.map((item: any) => ({
          id: item.id,
          region_name: item.region_name || '',
          nscb_code: item.nscb_code || '',
          nscb_name: item.nscb_name || '',
          added_by: item.added_by || '',
          status: item.status || '',
          date_updated: item.updated_at || item.date_updated || ''
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
      const response = await apiService.bulkDeleteRegion(selectedItems)
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

  const handleEdit = (item: RegionItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleSave = async (data: {
    regionName: string
    nscbCode: string
    nscbName: string
    addedBy: string
    status: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      if (editingItem) {
        // Update existing item
        const response = await apiService.updateRegion(editingItem.id, {
          regionName: data.regionName,
          nscbCode: data.nscbCode,
          nscbName: data.nscbName,
          addedBy: data.addedBy,
          status: data.status
        })
        if (response.success && response.data) {
          // Map database snake_case to frontend format (same as fetchItems)
          const mappedItem = {
            id: response.data.id,
            region_name: response.data.region_name || '',
            nscb_code: response.data.nscb_code || '',
            nscb_name: response.data.nscb_name || '',
            added_by: response.data.added_by || '',
            status: response.data.status || '',
            date_updated: response.data.updated_at || response.data.date_updated || ''
          }
          setItems(prev => prev.map(item => 
            item.id === editingItem.id
              ? mappedItem
              : item
          ))
          setIsModalOpen(false)
          setEditingItem(null)
        } else {
          setError(response.error || 'Failed to update item')
        }
      } else {
        // Add new item
        const response = await apiService.createRegion({
          regionName: data.regionName,
          nscbCode: data.nscbCode,
          nscbName: data.nscbName,
          addedBy: data.addedBy,
          status: data.status
        })
        if (response.success && response.data) {
          // Map database snake_case to frontend format (same as fetchItems)
          const mappedItem = {
            id: response.data.id,
            region_name: response.data.region_name || '',
            nscb_code: response.data.nscb_code || '',
            nscb_name: response.data.nscb_name || '',
            added_by: response.data.added_by || '',
            status: response.data.status || '',
            date_updated: response.data.updated_at || response.data.date_updated || ''
          }
          setItems(prev => [...prev, mappedItem])
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

  const handleDelete = (item: RegionItem) => {
    setDeleteType('single')
    setDeleteId(item.id)
    setDeleteItemName(item.region_name)
    setIsDeleteModalOpen(true)
  }

  const confirmSingleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.deleteRegion(deleteId)
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
      }`}>Region</h1>
      
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
              Region ID <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Region Name <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              NSCB Code <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              NSCB Name <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Added By <RequiredAsterisk />
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Date Updated
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Status <RequiredAsterisk />
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
              <td colSpan={9} className={`px-4 py-4 text-center text-sm ${
                theme === 'dark' ? 'text-white' : 'text-gray-500'
              }`}>
                Loading...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={9} className={`px-4 py-4 text-center text-sm ${
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
                  {item.region_name}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.nscb_code}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.nscb_name}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.added_by}
                </td>
                <td className={`px-6 py-2 whitespace-nowrap text-sm text-left ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.date_updated ? new Date(item.date_updated).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-left">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wide border
                    ${item.status?.toUpperCase() === 'ACTIVE' 
                      ? theme === 'dark'
                        ? 'bg-green-900/60 text-green-300 border-green-600/50'
                        : 'bg-green-100 text-green-700 border-green-500'
                      : theme === 'dark'
                        ? 'bg-gray-800/60 text-gray-400 border-gray-600/50'
                        : 'bg-gray-100 text-gray-600 border-gray-400'
                    }
                  `}>
                    {item.status}
                  </span>
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

      <RegionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSave}
        initialData={editingItem ? {
          id: editingItem.id,
          region_name: editingItem.region_name,
          nscb_code: editingItem.nscb_code,
          nscb_name: editingItem.nscb_name,
          added_by: editingItem.added_by,
          status: editingItem.status
        } : null}
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

export default Region
