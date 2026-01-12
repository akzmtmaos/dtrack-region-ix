import { useState, useEffect, useMemo } from 'react'

interface UsePaginationOptions<T> {
  items: T[]
  itemsPerPage?: number
  searchQuery?: string
  searchFilter?: (item: T, searchQuery: string) => boolean
}

interface UsePaginationReturn<T> {
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  filteredItems: T[]
  paginatedItems: T[]
  startIndex: number
  endIndex: number
}

/**
 * Custom hook for handling pagination and search functionality
 * @param options - Configuration options for pagination
 * @returns Pagination state and computed values
 */
export function usePagination<T>({
  items,
  itemsPerPage = 20,
  searchQuery = '',
  searchFilter
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items
    }

    if (searchFilter) {
      return items.filter(item => searchFilter(item, searchQuery))
    }

    // Default search: convert item to string and search
    const searchLower = searchQuery.toLowerCase()
    return items.filter(item => {
      const itemString = JSON.stringify(item).toLowerCase()
      return itemString.includes(searchLower)
    })
  }, [items, searchQuery, searchFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handlePageChange = (page: number) => {
    const calculatedTotalPages = Math.ceil(filteredItems.length / itemsPerPage)
    if (page >= 1 && page <= calculatedTotalPages) {
      setCurrentPage(page)
    }
  }

  return {
    currentPage,
    setCurrentPage: handlePageChange,
    totalPages,
    filteredItems,
    paginatedItems,
    startIndex,
    endIndex
  }
}
