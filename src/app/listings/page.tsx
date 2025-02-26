'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FormEntry {
  id: string
  name: string
  address: string
  invoiceNo: string
  date: string
  accountingFees: number
  taxConsultancy: number
  consultancyFees: number
  taxationFees: number
  otherCharges: number
}

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
  const entriesPerPage = 3

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }


  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Invoice Listings</h1>
          <Link 
            href="/" 
            className="px-4 py-2 rounded border bg-zinc-50 hover:bg-zinc-300 text-zinc-900 border-zinc-800  transition"
          >
            Create New Invoice
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or invoice number..."
            className="w-full bg-zinc-900 border border-gray-700 rounded-lg px-4 py-2"
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
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left cursor-pointer hover:bg-zinc-800"
                      onClick={() => handleSort('date')}
                    >
                      Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left cursor-pointer hover:bg-zinc-800"
                      onClick={() => handleSort('invoiceNo')}
                    >
                      Invoice No {sortField === 'invoiceNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left cursor-pointer hover:bg-zinc-800"
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
                        className="border-b border-gray-700 hover:bg-zinc-800/50"
                      >
                        <td className="px-6 py-4">{entry.date}</td>
                        <td className="px-6 py-4">{entry.invoiceNo}</td>
                        <td className="px-6 py-4">{entry.name}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(totalAmount)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => window.open(`/api/generate-pdf?id=${entry.id}`, '_blank')}
                              className="px-4 py-2 rounded border hover:bg-zinc-50  hover:text-zinc-900 border-zinc-800  transition"
                              disabled={actionLoading}
                            >
                              View
                            </button>
                            <Link
                              href={`/edit/${entry.id}`}
                              className="px-4 py-2 rounded border hover:bg-zinc-50  hover:text-zinc-900 border-zinc-800  transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="px-4 py-2 rounded border bg-red-600 hover:bg-red-700   border-zinc-800  transition"
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
                        ? 'bg-zinc-50 text-zinc-900'
                        : 'border hover:bg-zinc-600'
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
