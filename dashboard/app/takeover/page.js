'use client'

import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { Send, Bot, User, Phone, Search, X, MessageSquare } from 'lucide-react'
import { io } from 'socket.io-client'

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

export default function TakeoverPage() {
  const [conversations, setConversations] = useState([])
  const [selectedPhone, setSelectedPhone] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    
    socketRef.current = io(BOT_API_URL)
    
    socketRef.current.on('new_message', (data) => {
      setConversations(prev => {
        const existing = prev.find(c => c.phone_number === data.phoneNumber)
        if (existing) {
          return prev.map(c => 
            c.phone_number === data.phoneNumber 
              ? { ...c, last_message: data.message, last_time: new Date().toISOString(), unread: (c.unread || 0) + 1 }
              : c
          )
        }
        return [{
          phone_number: data.phoneNumber,
          user_name: data.pushName,
          last_message: data.message,
          last_time: new Date().toISOString(),
          mode: data.mode,
          unread: 1
        }, ...prev]
      })
    })

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchConversations() {
    setLoading(true)
    try {
      const res = await fetch(`${BOT_API_URL}/api/chat?limit=100`)
      const data = await res.json()
      
      const convMap = {}
      data.data?.forEach(chat => {
        const phone = chat.phone_number
        if (!convMap[phone] || new Date(chat.created_at) > new Date(convMap[phone].last_time)) {
          convMap[phone] = {
            phone_number: phone,
            user_name: chat.user_name,
            last_message: chat.user_message,
            last_time: chat.created_at,
            mode: chat.session_mode,
            unread: 0
          }
        }
      })
      
      setConversations(Object.values(convMap).sort((a, b) => 
        new Date(b.last_time) - new Date(a.last_time)
      ))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  function selectConversation(conv) {
    setSelectedPhone(conv.phone_number)
    setSelectedUser(conv.user_name)
    setMessages([
      { type: 'user', text: conv.last_message, time: conv.last_time }
    ])
  }

  async function handleTakeover() {
    if (!selectedPhone) return
    
    socketRef.current.emit('admin_takeover', {
      phoneNumber: selectedPhone,
      adminName: 'Admin'
    })

    setConversations(prev => 
      prev.map(c => 
        c.phone_number === selectedPhone ? { ...c, mode: 'admin' } : c
      )
    )
  }

  async function handleRelease() {
    if (!selectedPhone) return
    
    socketRef.current.emit('admin_release', {
      phoneNumber: selectedPhone
    })

    setConversations(prev => 
      prev.map(c => 
        c.phone_number === selectedPhone ? { ...c, mode: 'ai' } : c
      )
    )
  }

  async function handleSend() {
    if (!inputMessage.trim() || !selectedPhone || sending) return

    setSending(true)
    const userMsg = inputMessage.trim()
    setMessages(prev => [...prev, { type: 'admin', text: userMsg, time: new Date().toISOString() }])
    setInputMessage('')

    try {
      socketRef.current.emit('admin_send_message', {
        phoneNumber: selectedPhone,
        message: userMsg
      })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredConversations = conversations.filter(c => 
    c.phone_number.includes(searchTerm) || 
    c.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4">
        {/* Conversation List */}
        <div className="w-full md:w-80 brutal-card flex flex-col">
          <div className="p-3 border-b-2 border-[#E5E5E5]">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Percakapan</h3>
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Cari user..."
                className="brutal-input text-sm pl-7"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center py-8 text-[#737373] text-sm">Loading...</p>
            ) : filteredConversations.length === 0 ? (
              <p className="text-center py-8 text-[#737373] text-sm">Tidak ada percakapan</p>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.phone_number}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-3 text-left border-b border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors ${
                    selectedPhone === conv.phone_number ? 'bg-[#F5F5F5]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#171717] flex items-center justify-center text-white text-xs font-bold">
                        {conv.user_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[140px]">{conv.user_name}</p>
                        <p className="text-xs text-[#737373]">+{conv.phone_number}</p>
                      </div>
                    </div>
                    <span className={`badge ${conv.mode === 'admin' ? 'badge-admin' : 'badge-ai'}`}>
                      {conv.mode === 'admin' ? <User size={10} /> : <Bot size={10} />}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] mt-1 truncate">{conv.last_message}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 brutal-card flex flex-col">
          {selectedPhone ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b-2 border-[#E5E5E5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#171717] flex items-center justify-center text-white text-xs font-bold">
                    {selectedUser?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedUser}</p>
                    <p className="text-xs text-[#737373]">+{selectedPhone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {conversations.find(c => c.phone_number === selectedPhone)?.mode === 'admin' ? (
                    <button onClick={handleRelease} className="brutal-btn text-xs py-1 px-2">
                      <Bot size={14} /> Serahkan ke AI
                    </button>
                  ) : (
                    <button onClick={handleTakeover} className="brutal-btn brutal-btn-primary text-xs py-1 px-2">
                      <User size={14} /> Ambil Alih
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 border-2 ${
                      msg.type === 'admin' 
                        ? 'bg-[#171717] text-white border-[#171717]' 
                        : 'bg-white border-[#E5E5E5]'
                    }`}>
                      <div className="flex items-center gap-1 mb-1">
                        {msg.type === 'admin' ? <User size={12} /> : <Bot size={12} />}
                        <span className="text-[10px] opacity-70">
                          {msg.type === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-[10px] mt-1 opacity-50">
                        {new Date(msg.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t-2 border-[#E5E5E5]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik pesan..."
                    className="brutal-input text-sm flex-1"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={sending}
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={sending || !inputMessage.trim()}
                    className="brutal-btn brutal-btn-primary disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto text-[#E5E5E5] mb-3" />
                <p className="text-[#737373] text-sm">Pilih percakapan untuk memulai</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
