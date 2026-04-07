'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { Plus, Edit, Trash2, X, BookOpen, Calendar } from 'lucide-react'

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState('organisasi')
  const [knowledge, setKnowledge] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [formData, setFormData] = useState({
    id: '',
    pertanyaan_kunci: '',
    jawaban: '',
    nama: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    lokasi: '',
    tipe: 'offline',
    harga: 0
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  async function fetchData() {
    setLoading(true)
    try {
      if (activeTab === 'organisasi') {
        const res = await fetch(`${BOT_API_URL}/api/knowledge?category=organisasi`)
        const data = await res.json()
        setKnowledge(data)
      } else if (activeTab === 'event') {
        const res = await fetch(`${BOT_API_URL}/api/events`)
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setFormData({
      id: '', pertanyaan_kunci: '', jawaban: '',
      nama: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '',
      lokasi: '', tipe: 'offline', harga: 0
    })
    setModalType('add')
    setShowModal(true)
  }

  function openEditModal(item) {
    if (activeTab === 'organisasi') {
      setFormData({
        id: item.id,
        pertanyaan_kunci: item.pertanyaan_kunci.join(', '),
        jawaban: item.jawaban
      })
    } else {
      setFormData({
        id: item.id,
        nama: item.nama,
        deskripsi: item.deskripsi,
        tanggal_mulai: new Date(item.tanggal_mulai).toISOString().split('T')[0],
        tanggal_selesai: new Date(item.tanggal_selesai).toISOString().split('T')[0],
        lokasi: item.lokasi || '',
        tipe: item.tipe || 'offline',
        harga: item.harga || 0
      })
    }
    setModalType('edit')
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (activeTab === 'organisasi') {
      const payload = {
        category_id: activeTab === 'organisasi' 
          ? (await fetch(`${BOT_API_URL}/api/knowledge`).then(r => r.json()).then(d => d[0]?.category_id))
          : null,
        pertanyaan_kunci: formData.pertanyaan_kunci.split(',').map(s => s.trim()).filter(Boolean),
        jawaban: formData.jawaban
      }

      if (modalType === 'add') {
        await fetch(`${BOT_API_URL}/api/knowledge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        await fetch(`${BOT_API_URL}/api/knowledge/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
    } else {
      const payload = {
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        tanggalMulai: formData.tanggal_mulai,
        tanggalSelesai: formData.tanggal_selesai,
        lokasi: formData.lokasi,
        tipe: formData.tipe,
        harga: parseFloat(formData.harga) || 0
      }

      if (modalType === 'add') {
        await fetch(`${BOT_API_URL}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        await fetch(`${BOT_API_URL}/api/events/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
    }

    setShowModal(false)
    fetchData()
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus?')) return

    const endpoint = activeTab === 'organisasi' ? 'knowledge' : 'events'
    await fetch(`${BOT_API_URL}/api/${endpoint}/${id}`, { method: 'DELETE' })
    fetchData()
  }

  return (
    <DashboardLayout>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('organisasi')}
          className={`brutal-btn ${activeTab === 'organisasi' ? 'brutal-btn-primary' : ''}`}
        >
          <BookOpen size={16} /> Organisasi
        </button>
        <button
          onClick={() => setActiveTab('event')}
          className={`brutal-btn ${activeTab === 'event' ? 'brutal-btn-primary' : ''}`}
        >
          <Calendar size={16} /> Event
        </button>
      </div>

      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <button onClick={openAddModal} className="brutal-btn brutal-btn-primary">
          <Plus size={16} /> Tambah {activeTab === 'organisasi' ? 'FAQ' : 'Event'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-center py-8 text-[#737373]">Loading...</p>
      ) : activeTab === 'organisasi' ? (
        <div className="space-y-3">
          {knowledge.length === 0 ? (
            <p className="text-center py-8 text-[#737373]">Belum ada FAQ</p>
          ) : (
            knowledge.map((item) => (
              <div key={item.id} className="brutal-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Keywords</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.pertanyaan_kunci.map((pk, i) => (
                        <span key={i} className="text-xs bg-[#F5F5F5] border border-[#E5E5E5] px-2 py-0.5">
                          {pk}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm line-clamp-2">{item.jawaban}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => openEditModal(item)} className="brutal-btn text-xs py-1 px-2">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="brutal-btn brutal-btn-danger text-xs py-1 px-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-center py-8 text-[#737373]">Belum ada event</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="brutal-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.nama}</h4>
                    <p className="text-xs text-[#737373] mt-1">
                      {new Date(event.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {event.tanggal_selesai !== event.tanggal_mulai && ` - ${new Date(event.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                    </p>
                    {event.lokasi && <p className="text-xs text-[#737373] mt-0.5">📍 {event.lokasi}</p>}
                    <p className="text-sm mt-2 line-clamp-2">{event.deskripsi}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => openEditModal(event)} className="brutal-btn text-xs py-1 px-2">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="brutal-btn brutal-btn-danger text-xs py-1 px-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white border-2 border-[#E5E5E5] w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b-2 border-[#E5E5E5] flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold">
                {modalType === 'add' ? 'Tambah' : 'Edit'} {activeTab === 'organisasi' ? 'FAQ' : 'Event'}
              </h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {activeTab === 'organisasi' ? (
                <>
                  <div>
                    <label className="text-xs text-[#737373] uppercase tracking-wider mb-1 block">Keywords (pisah koma)</label>
                    <input
                      type="text"
                      className="brutal-input text-sm"
                      value={formData.pertanyaan_kunci}
                      onChange={(e) => setFormData(prev => ({ ...prev, pertanyaan_kunci: e.target.value }))}
                      placeholder="apa itu pormiki, pormiki, tentang pormiki"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#737373] uppercase tracking-wider mb-1 block">Jawaban</label>
                    <textarea
                      className="brutal-input text-sm min-h-[150px]"
                      value={formData.jawaban}
                      onChange={(e) => setFormData(prev => ({ ...prev, jawaban: e.target.value }))}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-[#737373] uppercase tracking-wider mb-1 block">Nama Event</label>
                    <input
                      type="text"
                      className="brutal-input text-sm"
                      value={formData.nama}
                      onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#737373] uppercase tracking-wider mb-1 block">Deskripsi</label>
                    <textarea
                      className="brutal-input text-sm min-h-[100px]"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#737373] uppercase tracking-wider mb-1 block">Tanggal Mulai</label>
                      <input
                        type="date"
                        className="brutal-input text-sm"
                        value={formData.tanggal_mulai}
                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal_mulai: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#737373] uppercase tracking-wider mb-1 block">Tanggal Selesai</label>
                      <input
                        type="date"
                        className="brutal-input text-sm"
                        value={formData.tanggal_selesai}
                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal_selesai: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#737373] uppercase tracking-wider mb-1 block">Lokasi</label>
                      <input
                        type="text"
                        className="brutal-input text-sm"
                        value={formData.lokasi}
                        onChange={(e) => setFormData(prev => ({ ...prev, lokasi: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#737373] uppercase tracking-wider mb-1 block">Harga (0 = gratis)</label>
                      <input
                        type="number"
                        className="brutal-input text-sm"
                        value={formData.harga}
                        onChange={(e) => setFormData(prev => ({ ...prev, harga: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#737373] uppercase tracking-wider mb-1 block">Tipe</label>
                    <select
                      className="brutal-input text-sm"
                      value={formData.tipe}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipe: e.target.value }))}
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="brutal-btn">
                  Batal
                </button>
                <button type="submit" className="brutal-btn brutal-btn-primary">
                  {modalType === 'add' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
