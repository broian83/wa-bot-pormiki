'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { QRCodeSVG } from 'qrcode.react'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

export default function QRPage() {
  const [qrCode, setQrCode] = useState(null)
  const [botStatus, setBotStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pairingCode, setPairingCode] = useState('')
  const [pairingLoading, setPairingLoading] = useState(false)
  const [pairingError, setPairingError] = useState('')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const [qrRes, statusRes] = await Promise.all([
        fetch(`${BOT_API_URL}/api/qr`),
        fetch(`${BOT_API_URL}/api/status`)
      ])
      const qrData = await qrRes.json()
      const statusData = await statusRes.json()
      setQrCode(qrData.qr)
      setBotStatus(statusData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  async function handleGeneratePairingCode() {
    try {
      setPairingLoading(true)
      setPairingError('')
      setPairingCode('')

      const res = await fetch(`${BOT_API_URL}/api/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat pairing code')
      }
      setPairingCode(data.pairingCode || '')
    } catch (error) {
      setPairingError(error.message || 'Gagal membuat pairing code')
    } finally {
      setPairingLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        {/* Status Card */}
        <div className={`brutal-card p-6 mb-6 text-center ${
          botStatus?.connected ? 'border-[#22C55E]' : 'border-[#E5E5E5]'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {botStatus?.connected ? (
              <Wifi className="text-[#22C55E]" size={24} />
            ) : (
              <WifiOff className="text-[#737373]" size={24} />
            )}
            <h2 className="text-lg font-bold">
              {botStatus?.connected ? 'Bot Terhubung' : 'Bot Terputus'}
            </h2>
          </div>
          <p className="text-sm text-[#737373]">
            {botStatus?.connected 
              ? 'WhatsApp Bot siap menerima pesan' 
              : 'Scan QR code di bawah untuk menghubungkan'}
          </p>
          {!botStatus?.connected && botStatus?.disconnectReason === 405 && (
            <p className="text-xs text-[#B91C1C] mt-2">
              QR sering gagal muncul (error 405). Gunakan Pairing Code di bawah sebagai alternatif.
            </p>
          )}
          {botStatus?.connected && (
            <p className="text-xs text-[#737373] mt-2">
              Terhubung sejak: {botStatus.connected_at 
                ? new Date(botStatus.connected_at).toLocaleString('id-ID') 
                : '-'}
            </p>
          )}
        </div>

        {/* QR Code */}
        {!botStatus?.connected && (
          <div className="brutal-card p-6 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Scan QR Code</h3>
            
            {qrCode ? (
              <div className="inline-block p-4 bg-white border-2 border-[#E5E5E5]">
                <QRCodeSVG value={qrCode} size={256} level="L" />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-[#F5F5F5] border-2 border-[#E5E5E5]">
                <p className="text-[#737373]">Menunggu QR code...</p>
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs text-[#737373] mb-3">
                1. Buka WhatsApp di HP Anda<br />
                2. Tap Menu atau Setelan → Perangkat Tertaut<br />
                3. Tap "Tautkan Perangkat"<br />
                4. Arahkan kamera ke QR code di atas
              </p>
              <button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="brutal-btn brutal-btn-primary text-sm"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {!qrCode && (
              <div className="mt-6 border-t border-[#E5E5E5] pt-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2">Alternatif: Pairing Code</p>
                <p className="text-xs text-[#737373] mb-3">
                  Masukkan nomor WhatsApp bot (format internasional, contoh: 6281234567890), lalu tap Generate.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="628xxxxxxxxxx"
                    className="flex-1 border-2 border-[#E5E5E5] px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleGeneratePairingCode}
                    disabled={pairingLoading || !phoneNumber.trim()}
                    className="brutal-btn brutal-btn-primary text-sm"
                  >
                    {pairingLoading ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                {pairingError && (
                  <p className="text-xs text-[#B91C1C] mt-2">{pairingError}</p>
                )}
                {pairingCode && (
                  <div className="mt-3 p-3 border-2 border-[#E5E5E5] bg-white text-center">
                    <p className="text-xs text-[#737373] mb-1">Pairing Code</p>
                    <p className="text-xl tracking-[0.25em] font-bold">{pairingCode}</p>
                    <p className="text-xs text-[#737373] mt-2">
                      Di WhatsApp: Perangkat Tertaut → Tautkan dengan nomor telepon.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Connected State */}
        {botStatus?.connected && (
          <div className="brutal-card p-6 text-center">
            <div className="w-16 h-16 bg-[#F0FDF4] border-2 border-[#22C55E] flex items-center justify-center mx-auto mb-4">
              <Wifi className="text-[#22C55E]" size={32} />
            </div>
            <h3 className="font-semibold mb-2">Bot Siap Digunakan</h3>
            <p className="text-sm text-[#737373] mb-4">
              Bot sudah terhubung dan siap menerima pesan dari anggota PORMIKI
            </p>
            <div className="text-xs text-[#737373] space-y-1">
              <p>• Anggota bisa langsung chat ke nomor bot</p>
              <p>• Ketik "menu" untuk melihat daftar perintah</p>
              <p>• Admin bisa monitor chat di halaman Chat</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="brutal-card p-6 text-center">
            <p className="text-[#737373]">Memuat status bot...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
