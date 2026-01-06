import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Pagination from '../../components/Pagination'
import Input from '../../components/Input'
import Table from '../../components/Table'

interface Document {
  id: number
  documentNumber: string
  subject: string
  recipient: string
  dateSent: string
  status: string
  priority: string
}

const DocumentByActionOfficer: React.FC = () => {
  const { theme } = useTheme()
  const documents: Document[] = []
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(1)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'Sent':
          return 'bg-green-500/20 text-green-400'
        case 'Pending':
          return 'bg-yellow-500/20 text-yellow-400'
        case 'Failed':
          return 'bg-red-500/20 text-red-400'
        default:
          return 'bg-gray-500/20 text-gray-400'
      }
    } else {
      switch (status) {
        case 'Sent':
          return 'bg-green-100 text-green-800'
        case 'Pending':
          return 'bg-yellow-100 text-yellow-800'
        case 'Failed':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const getPriorityColor = (priority: string) => {
    if (theme === 'dark') {
      switch (priority) {
        case 'High':
          return 'bg-red-500/20 text-red-400'
        case 'Medium':
          return 'bg-yellow-500/20 text-yellow-400'
        case 'Low':
          return 'bg-blue-500/20 text-blue-400'
        default:
          return 'bg-gray-500/20 text-gray-400'
      }
    } else {
      switch (priority) {
        case 'High':
          return 'bg-red-100 text-red-800'
        case 'Medium':
          return 'bg-yellow-100 text-yellow-800'
        case 'Low':
          return 'bg-blue-100 text-blue-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }

  return (
    <div className="container mx-auto px-6 pt-6 pb-8">
      <h1 className={`text-2xl font-semibold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>Document By Action Officer</h1>
      
      <div className="flex justify-end items-center gap-3 mb-4">
        <Input
          type="text"
          placeholder="Search..."
          className="w-64"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            totalItems={documents.length}
            itemsPerPage={10}
          />
        }
      >
        <thead className={theme === 'dark' ? 'bg-dark-hover/50' : 'bg-gray-50/50'}>
          <tr>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Action Officer
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Office
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Doc Type
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Subject
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Date
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Action Taken
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Doc. Control No.
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Remarks
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Status
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${
          theme === 'dark' ? 'bg-dark-panel divide-dark-hover' : 'bg-white divide-gray-200'
        }`}>
          {documents.length === 0 ? (
            <tr>
              <td colSpan={10} className={`px-6 py-8 text-center text-sm ${
                theme === 'dark' ? 'text-white' : 'text-gray-500'
              }`}>
                No documents found
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr 
                key={doc.id} 
                className={`transition-colors ${
                  theme === 'dark' ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'
                }`}
              >
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.documentNumber}
                </td>
                <td className={`px-6 py-4 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.subject}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.recipient}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {doc.dateSent}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  -
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  -
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  -
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  )
}

export default DocumentByActionOfficer