'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight, Bot, User, Send, X } from 'lucide-react'

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

export default function ChatPage() {
  const [chats, setChats] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    phone: '',
    category: '',
    mode: '',
    startDate: '',
    endDate: ''
  })
  const [selectedChat, setSelectedChat] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchChats()
  }, [currentPage, filters])

  async function fetchChats() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      })
      const res = await fetch(`${BOT_API_URL}/api/chat?${params}`)
      const data = await res.json()
      setChats(data.data || [])
      setTotalPages(Math.ceil((data.count || 0) / 20))
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  function applyFilters() {
    fetchChats()
  }

  function resetFilters() {
    setFilters({ phone: '', category: '', mode: '', startDate: '', endDate: '' })
    setCurrentPage(1)
  }

  function exportCSV() {
    const headers = ['Tanggal', 'Phone', 'Nama', 'Pesan', 'Jawaban', 'Mode', 'Kategori']
    const rows = chats.map(c => [
      new Date(c.created_at).toLocaleString('id-ID'),
      c.phone_number,
      c.user_name,
      `"${c.user_message?.replace(/"/g, '""')}"`,
      `"${c.ai_response?.replace(/"/g, '""')}"`,
      c.session_mode,
      c.category || ''
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  function formatPhone(phone) {
    return '+' + phone
  }

  return (
    <DashboardLayout>
      {/* Filters */}
      <div className="brutal-card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Filter</h3>
          <button onClick={resetFilters} className="text-xs text-[#737373] hover:text-[#171717]">
            Reset
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Nomor HP..."
            className="brutal-input text-sm"
            value={filters.phone}
            onChange={(e) => handleFilterChange('phone', e.target.value)}
          />
          <select
            className="brutal-input text-sm"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="organisasi">Organisasi</option>
            <option value="event">Event</option>
          </select>
          <select
            className="brutal-input text-sm"
            value={filters.mode}
            onChange={(e) => handleFilterChange('mode', e.target.value)}
          >
            <option value="">Semua Mode</option>
            <option value="ai">AI</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type="date"
            className="brutal-input text-sm"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
          <input
            type="date"
            className="brutal-input text-sm"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-3 gap-2">
          <button onClick={exportCSV} className="brutal-btn text-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={applyFilters} className="brutal-btn brutal-btn-primary text-sm">
            <Filter size={16} /> Terapkan
          </button>
        </div>
      </div>

      {/* Chat List - Desktop Table */}
      <div className="hidden md:block brutal-card overflow-hidden">
        <table className="brutal-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>User</th>
              <th>Pesan</th>
              <th>Mode</th>
              <th>Kategori</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-[#737373]">Loading...</td>
              </tr>
            ) : chats.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-[#737373]">Tidak ada data</td>
              </tr>
            ) : (
              chats.map((chat) => (
                <tr key={chat.id}>
                  <td className="text-xs text-[#737373]">
                    {new Date(chat.created_at).toLocaleString('id-ID', { 
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                  <td>
                    <div>
                      <p className="text-sm font-medium">{chat.user_name}</p>
                      <p className="text-xs text-[#737373]">{formatPhone(chat.phone_number)}</p>
                    </div>
                  </td>
                  <td className="max-w-xs truncate text-sm">{chat.user_message}</td>
                  <td>
                    <span className={`badge ${chat.session_mode === 'ai' ? 'badge-ai' : 'badge-admin'}`}>
                      {chat.session_mode === 'ai' ? <Bot size={12} /> : <User size={12} />}
                      {chat.session_mode?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {chat.category && (
                      <span className="badge bg-[#F5F5F5] border-[#E5E5E5] text-[#737373]">
                        {chat.category}
                      </span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => { setSelectedChat(chat); setShowDetail(true) }}
                      className="brutal-btn text-xs py-1 px-2"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Chat List - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <p className="text-center py-8 text-[#737373]">Loading...</p>
        ) : chats.length === 0 ? (
          <p className="text-center py-8 text-[#737373]">Tidak ada data</p>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="brutal-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{chat.user_name}</p>
                  <p className="text-xs text-[#737373]">{formatPhone(chat.phone_number)}</p>
                </div>
                <span className={`badge ${chat.session_mode === 'ai' ? 'badge-ai' : 'badge-admin'}`}>
                  {chat.session_mode?.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-[#737373] line-clamp-2 mb-2">{chat.user_message}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#737373]">
                  {new Date(chat.created_at).toLocaleString('id-ID', { 
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                  })}
                </span>
                <button 
                  onClick={() => { setSelectedChat(chat); setShowDetail(true) }}
                  className="brutal-btn text-xs py-1 px-2"
                >
                  <Eye size={14} /> Detail
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[#737373]">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="brutal-btn text-sm disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="brutal-btn text-sm disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white border-2 border-[#E5E5E5] w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b-2 border-[#E5E5E5] flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold">Detail Chat</h3>
              <button onClick={() => setShowDetail(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">User</p>
                <p className="font-medium">{selectedChat.user_name}</p>
                <p className="text-sm text-[#737373]">{formatPhone(selectedChat.phone_number)}</p>
              </div>
              <div>
                <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Waktu</p>
                <p className="text-sm">{new Date(selectedChat.created_at).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Pesan User</p>
                <div className="brutal-card p-3 bg-[#F5F5F5]">
                  <p className="text-sm">{selectedChat.user_message}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Jawaban AI</p>
                <div className="brutal-card p-3 bg-[#F5F5F5]">
                  <p className="text-sm whitespace-pre-line">{selectedChat.ai_response}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Mode</p>
                  <span className={`badge ${selectedChat.session_mode === 'ai' ? 'badge-ai' : 'badge-admin'}`}>
                    {selectedChat.session_mode?.toUpperCase()}
                  </span>
                </div>
                {selectedChat.category && (
                  <div>
                    <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Kategori</p>
                    <span className="badge bg-[#F5F5F5] border-[#E5E5E5]">{selectedChat.category}</span>
                  </div>
                )}
                {selectedChat.model_ai && (
                  <div>
                    <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Model AI</p>
                    <span className="badge bg-[#F5F5F5] border-[#E5E5E5]">{selectedChat.model_ai}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
