'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { Settings, Check, Bot } from 'lucide-react'

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

export default function SettingsPage() {
  const [models, setModels] = useState([])
  const [currentModel, setCurrentModel] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchModels()
  }, [])

  async function fetchModels() {
    try {
      const res = await fetch(`${BOT_API_URL}/api/models`)
      const data = await res.json()
      setModels(data.models || [])
      setCurrentModel(data.current || '')
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleModelChange(modelId) {
    setSaving(true)
    setMessage(null)
    
    try {
      const res = await fetch(`${BOT_API_URL}/api/models/current`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId })
      })
      const data = await res.json()
      
      if (data.success) {
        setCurrentModel(modelId)
        setMessage({ type: 'success', text: 'Model AI berhasil diganti!' })
      } else {
        setMessage({ type: 'error', text: 'Gagal mengganti model' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="brutal-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#171717] text-white">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Pengaturan AI</h2>
              <p className="text-sm text-[#737373]">Pilih model AI yang digunakan bot</p>
            </div>
          </div>

          {message && (
            <div className={`p-3 mb-4 border-2 ${
              message.type === 'success' ? 'border-[#22C55E] bg-[#F0FDF4]' : 'border-[#EF4444] bg-[#FEF2F2]'
            }`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {loading ? (
            <p className="text-center py-8 text-[#737373]">Loading...</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#737373] uppercase tracking-wider mb-3">
                Model yang tersedia
              </p>
              
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  disabled={saving}
                  className={`w-full p-4 border-2 text-left transition-all ${
                    currentModel === model.id
                      ? 'border-[#171717] bg-[#171717] text-white'
                      : 'border-[#E5E5E5] hover:border-[#171717]'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className={`text-xs ${currentModel === model.id ? 'text-gray-300' : 'text-[#737373]'}`}>
                        {model.provider}
                      </p>
                    </div>
                    {currentModel === model.id && (
                      <Check size={20} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-[#F5F5F5] border border-[#E5E5E5]">
            <div className="flex items-start gap-2">
              <Bot size={16} className="mt-0.5" />
              <div className="text-xs text-[#737373]">
                <p className="font-medium text-[#171717] mb-1">Tips:</p>
                <p>• Model dengan rating "Fast" lebih cepat responsenya</p>
                <p>• Model "Smart" memberikan jawaban lebih berkualitas</p>
                <p>• Anda bisa ganti model kapan saja dari halaman ini</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}