import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface Permission {
  addCopy: boolean
  delete: boolean
  edit: boolean
  listSearchView: boolean
}

interface TablePermission {
  tableName: string
  displayName: string
  color?: 'green' | 'red' | 'normal'
  permissions: Permission
}

interface UserLevelPermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (permissions: Record<string, Permission>) => void
  userLevel: { id: number; userLevelName: string }
}

const UserLevelPermissionsModal: React.FC<UserLevelPermissionsModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  userLevel
}) => {
  const { theme } = useTheme()
  
  // Define all tables/views with their display names and initial permissions
  const initialTables: TablePermission[] = [
    { tableName: 'action_officer', displayName: 'Action Office', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'action_required', displayName: 'Action Required', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'action_taken', displayName: 'Action Taken', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'document_type', displayName: 'Document Type', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'document_destination', displayName: 'Document Destination', color: 'normal', permissions: { addCopy: true, delete: true, edit: true, listSearchView: true } },
    { tableName: 'document_source_outbox', displayName: 'Document Source (OUTBOX)', color: 'green', permissions: { addCopy: true, delete: true, edit: true, listSearchView: true } },
    { tableName: 'office', displayName: 'Office', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'region', displayName: 'Region', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'time_required', displayName: 'Time Required', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'user_account', displayName: 'User Account', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'external_documents', displayName: 'External Documents', color: 'normal', permissions: { addCopy: true, delete: true, edit: true, listSearchView: true } },
    { tableName: 'custom_action_officer', displayName: 'custom action officer', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'customview_docdetails_origin', displayName: 'Custom View docdetails origin', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'customview_doc_link', displayName: 'customview doc link', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'test_doc', displayName: 'test doc', color: 'normal', permissions: { addCopy: true, delete: true, edit: true, listSearchView: true } },
    { tableName: 'inbox_received', displayName: 'INBOX - Received', color: 'red', permissions: { addCopy: true, delete: true, edit: true, listSearchView: true } },
    { tableName: 'inbox_action_taken', displayName: 'INBOX - Action Taken', color: 'normal', permissions: { addCopy: true, delete: true, edit: true, listSearchView: true } },
    { tableName: 'personal_group', displayName: 'Personal Group', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
    { tableName: 'document_action_required_days', displayName: 'Document/Action Required Days', color: 'normal', permissions: { addCopy: false, delete: false, edit: false, listSearchView: false } },
  ]

  const [tables, setTables] = useState<TablePermission[]>(initialTables)
  const [selectAll, setSelectAll] = useState<Record<string, boolean>>({
    addCopy: false,
    delete: false,
    edit: false,
    listSearchView: false
  })

  useEffect(() => {
    // Calculate select all states based on current permissions
    const allAddCopy = tables.every(t => t.permissions.addCopy)
    const allDelete = tables.every(t => t.permissions.delete)
    const allEdit = tables.every(t => t.permissions.edit)
    const allListSearchView = tables.every(t => t.permissions.listSearchView)

    setSelectAll({
      addCopy: allAddCopy && tables.length > 0,
      delete: allDelete && tables.length > 0,
      edit: allEdit && tables.length > 0,
      listSearchView: allListSearchView && tables.length > 0
    })
  }, [tables])

  const handlePermissionChange = (tableName: string, permissionType: keyof Permission, value: boolean) => {
    setTables(prev => prev.map(table => 
      table.tableName === tableName
        ? { ...table, permissions: { ...table.permissions, [permissionType]: value } }
        : table
    ))
  }

  const handleSelectAll = (permissionType: keyof Permission, value: boolean) => {
    setTables(prev => prev.map(table => ({
      ...table,
      permissions: { ...table.permissions, [permissionType]: value }
    })))
    setSelectAll(prev => ({ ...prev, [permissionType]: value }))
  }

  const handleUpdate = () => {
    const permissionsMap: Record<string, Permission> = {}
    tables.forEach(table => {
      permissionsMap[table.tableName] = table.permissions
    })
    onUpdate(permissionsMap)
  }

  const handleClose = () => {
    // Reset to initial state on close
    setTables(initialTables)
    onClose()
  }

  if (!isOpen) return null

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'
  const tableHeaderBg = theme === 'dark' ? '#1f1f1f' : '#f9fafb'
  const rowBgEven = theme === 'dark' ? '#1f1f1f' : '#ffffff'
  const rowBgOdd = theme === 'dark' ? '#171717' : '#f9fafb'
  const checkboxBg = theme === 'dark' ? '#171717' : '#ffffff'
  const checkboxBorder = theme === 'dark' ? '#404040' : '#d1d5db'

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      onClick={handleClose}
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>
            User Level Permissions
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            Manage permissions for User Level: <span style={{ color: textPrimary, fontWeight: 500 }}>{userLevel.userLevelName} ({userLevel.id})</span>
          </p>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: tableHeaderBg }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280', borderBottom: `1px solid ${borderColor}` }}>
                    Tables/Views
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280', borderBottom: `1px solid ${borderColor}` }}>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectAll.addCopy}
                        onChange={(e) => handleSelectAll('addCopy', e.target.checked)}
                        className="rounded text-green-600 focus:ring-green-500"
                        style={{
                          backgroundColor: checkboxBg,
                          borderColor: checkboxBorder
                        }}
                      />
                      <span>Add/Copy</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280', borderBottom: `1px solid ${borderColor}` }}>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectAll.delete}
                        onChange={(e) => handleSelectAll('delete', e.target.checked)}
                        className="rounded text-green-600 focus:ring-green-500"
                        style={{
                          backgroundColor: checkboxBg,
                          borderColor: checkboxBorder
                        }}
                      />
                      <span>Delete</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280', borderBottom: `1px solid ${borderColor}` }}>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectAll.edit}
                        onChange={(e) => handleSelectAll('edit', e.target.checked)}
                        className="rounded text-green-600 focus:ring-green-500"
                        style={{
                          backgroundColor: checkboxBg,
                          borderColor: checkboxBorder
                        }}
                      />
                      <span>Edit</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280', borderBottom: `1px solid ${borderColor}` }}>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectAll.listSearchView}
                        onChange={(e) => handleSelectAll('listSearchView', e.target.checked)}
                        className="rounded text-green-600 focus:ring-green-500"
                        style={{
                          backgroundColor: checkboxBg,
                          borderColor: checkboxBorder
                        }}
                      />
                      <span>List/Search/View</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table, index) => {
                  const rowBg = index % 2 === 0 ? rowBgEven : rowBgOdd
                  
                  const textColor = table.color === 'green'
                    ? '#10b981'
                    : table.color === 'red'
                    ? '#ef4444'
                    : (theme === 'dark' ? '#e5e7eb' : '#374151')

                  return (
                    <tr 
                      key={table.tableName} 
                      style={{ backgroundColor: rowBg }}
                      className="hover:opacity-90 transition-opacity"
                    >
                      <td className="px-4 py-3 text-sm" style={{ color: textColor, fontWeight: table.color !== 'normal' ? '600' : '400' }}>
                        {table.displayName}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={table.permissions.addCopy}
                          onChange={(e) => handlePermissionChange(table.tableName, 'addCopy', e.target.checked)}
                          className="rounded text-green-600 focus:ring-green-500"
                          style={{
                            backgroundColor: checkboxBg,
                            borderColor: checkboxBorder
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={table.permissions.delete}
                          onChange={(e) => handlePermissionChange(table.tableName, 'delete', e.target.checked)}
                          className="rounded text-green-600 focus:ring-green-500"
                          style={{
                            backgroundColor: checkboxBg,
                            borderColor: checkboxBorder
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={table.permissions.edit}
                          onChange={(e) => handlePermissionChange(table.tableName, 'edit', e.target.checked)}
                          className="rounded text-green-600 focus:ring-green-500"
                          style={{
                            backgroundColor: checkboxBg,
                            borderColor: checkboxBorder
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={table.permissions.listSearchView}
                          onChange={(e) => handlePermissionChange(table.tableName, 'listSearchView', e.target.checked)}
                          className="rounded text-green-600 focus:ring-green-500"
                          style={{
                            backgroundColor: checkboxBg,
                            borderColor: checkboxBorder
                          }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end gap-2"
          style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: modalBg }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{
              color: textSecondary,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{
              color: '#ffffff',
              backgroundColor: '#3ecf8e'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#35b87a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3ecf8e'}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserLevelPermissionsModal
