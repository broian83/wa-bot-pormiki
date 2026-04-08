'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { Settings, Check, Bot, Key, Eye, EyeOff, Save } from 'lucide-react'

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

export default function SettingsPage() {
  const [models, setModels] = useState([])
  const [currentModel, setCurrentModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('model')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [modelsRes, apiKeyRes] = await Promise.all([
        fetch(`${BOT_API_URL}/api/models`),
        fetch(`${BOT_API_URL}/api/apikey`)
      ])
      const modelsData = await modelsRes.json()
      const apiKeyData = await apiKeyRes.json()
      
      setModels(modelsData.models || [])
      setCurrentModel(modelsData.current || '')
      setApiKey(apiKeyData.apiKey || '')
    } catch (error) {
      console.error('Error fetching data:', error)
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

  async function handleApiKeyUpdate(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    
    try {
      const res = await fetch(`${BOT_API_URL}/api/apikey`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey })
      })
      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'API Key berhasil diupdate!' })
        setShowApiKey(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal update API Key' })
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
              <p className="text-sm text-[#737373]">Kelola model AI dan API Key</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('model')}
              className={`brutal-btn text-sm ${activeTab === 'model' ? 'brutal-btn-primary' : ''}`}
            >
              <Bot size={16} /> Model AI
            </button>
            <button
              onClick={() => setActiveTab('apikey')}
              className={`brutal-btn text-sm ${activeTab === 'apikey' ? 'brutal-btn-primary' : ''}`}
            >
              <Key size={16} /> API Key
            </button>
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
            <>
              {/* Model Selection Tab */}
              {activeTab === 'model' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#737373] uppercase tracking-wider mb-3">
                    Model yang tersedia ({models.length} model)
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

              {/* API Key Tab */}
              {activeTab === 'apikey' && (
                <form onSubmit={handleApiKeyUpdate} className="space-y-4">
                  <div>
                    <label className="text-xs text-[#737373] uppercase tracking-wider mb-2 block">
                      SumoPod API Key
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="brutal-input text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373]"
                        >
                          {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={saving || !apiKey}
                        className="brutal-btn brutal-btn-primary disabled:opacity-50"
                      >
                        <Save size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-[#737373] mt-2">
                      Dapatkan API Key di: https://agentrouter.org/console/token
                    </p>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="mt-6 p-4 bg-[#F5F5F5] border border-[#E5E5E5]">
            <div className="flex items-start gap-2">
              <Bot size={16} className="mt-0.5" />
              <div className="text-xs text-[#737373]">
                <p className="font-medium text-[#171717] mb-1">Tips:</p>
                <p>• Model dengan suffix "Mini/Nano" lebih cepat dan murah</p>
                <p>• Model dengan "90% Off" adalah yang termurah</p>
                <p>• seed-2-0-mini adalah model default (paling murah)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}