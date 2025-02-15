'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FormEntry } from '@prisma/client'

interface ApiResponse {
  entries: FormEntry[]
  totalCount: number
  totalPages: number
}

export default function ListingsPage() {
  const [entries, setEntries] = useState<FormEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof FormEntry>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const entriesPerPage = 10

  useEffect(() => {
    fetchEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortField, sortOrder, searchTerm])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        search: searchTerm,
        sortField: sortField.toString(),
        sortOrder: sortOrder
      })

      const response = await fetch(`/api/entries?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch entries')
      }
      
      const data: ApiResponse = await response.json()
      setEntries(data.entries)
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchEntries()
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSort = (field: keyof FormEntry) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Invoice Listings</h1>
          <Link 
            href="/" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Create New Invoice
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or invoice number..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left cursor-pointer hover:bg-gray-600"
                      onClick={() => handleSort('date')}
                    >
                      Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left cursor-pointer hover:bg-gray-600"
                      onClick={() => handleSort('invoiceNo')}
                    >
                      Invoice No {sortField === 'invoiceNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left cursor-pointer hover:bg-gray-600"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const totalAmount = 
                      entry.accountingFees + 
                      entry.taxConsultancy + 
                      entry.consultancyFees + 
                      entry.taxationFees + 
                      entry.otherCharges

                    return (
                      <tr 
                        key={entry.id} 
                        className="border-b border-gray-700 hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4">{formatDate(entry.date)}</td>
                        <td className="px-6 py-4">{entry.invoiceNo}</td>
                        <td className="px-6 py-4">{entry.name}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(totalAmount)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => window.open(`/api/generate-pdf?invoiceNo=${entry.invoiceNo}`, '_blank')}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                              disabled={actionLoading}
                            >
                              View
                            </button>
                            <Link
                              href={`/edit/${entry.id}`}
                              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                              disabled={actionLoading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalCount)} of {totalCount} entries
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
} 