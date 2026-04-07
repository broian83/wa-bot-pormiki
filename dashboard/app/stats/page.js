'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { Download, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'
const COLORS = ['#171717', '#737373', '#E5E5E5', '#22C55E', '#3B82F6', '#F59E0B']

export default function StatsPage() {
  const [dailyStats, setDailyStats] = useState(null)
  const [stats, setStats] = useState(null)
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [days])

  async function fetchData() {
    setLoading(true)
    try {
      const [dailyRes, statsRes] = await Promise.all([
        fetch(`${BOT_API_URL}/api/stats/daily?days=${days}`),
        fetch(`${BOT_API_URL}/api/stats`)
      ])
      const dailyData = await dailyRes.json()
      const statsData = await statsRes.json()
      setDailyStats(dailyData)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  function exportCSV() {
    if (!dailyStats?.dailyData) return
    const headers = ['Tanggal', 'Jumlah Chat']
    const rows = dailyStats.dailyData.map(d => [d.date, d.count])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stats-${days}-days.csv`
    a.click()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#737373]">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`brutal-btn text-sm ${days === d ? 'brutal-btn-primary' : ''}`}
            >
              {d} Hari
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="brutal-btn text-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="brutal-card p-4">
          <p className="text-xs text-[#737373] uppercase tracking-wider">Total Chat</p>
          <p className="text-2xl font-bold mt-1">{stats?.totalChat?.toLocaleString() || 0}</p>
        </div>
        <div className="brutal-card p-4">
          <p className="text-xs text-[#737373] uppercase tracking-wider">AI Mode</p>
          <p className="text-2xl font-bold mt-1">{stats?.aiModeChat?.toLocaleString() || 0}</p>
          <p className="text-xs text-[#737373] mt-1">
            {stats?.totalChat > 0 ? Math.round((stats.aiModeChat / stats.totalChat) * 100) : 0}% dari total
          </p>
        </div>
        <div className="brutal-card p-4">
          <p className="text-xs text-[#737373] uppercase tracking-wider">Admin Mode</p>
          <p className="text-2xl font-bold mt-1">{stats?.adminModeChat?.toLocaleString() || 0}</p>
          <p className="text-xs text-[#737373] mt-1">
            {stats?.totalChat > 0 ? Math.round((stats.adminModeChat / stats.totalChat) * 100) : 0}% dari total
          </p>
        </div>
        <div className="brutal-card p-4">
          <p className="text-xs text-[#737373] uppercase tracking-wider">Unique Users</p>
          <p className="text-2xl font-bold mt-1">{stats?.uniqueUsers?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Chat Trend */}
      <div className="brutal-card p-4 mb-6">
        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Tren Chat {days} Hari Terakhir</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyStats?.dailyData || []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#171717" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#737373" />
              <YAxis tick={{ fontSize: 10 }} stroke="#737373" />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '2px solid #171717', 
                  borderRadius: 0,
                  fontSize: 12
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#171717" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category + Mode Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="brutal-card p-4">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Distribusi Kategori</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dailyStats?.categoryData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(dailyStats?.categoryData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '2px solid #171717', 
                    borderRadius: 0 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="brutal-card p-4">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">AI vs Admin</h3>
          <div className="h-64 max-w-xs mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats?.modelData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#737373" />
                <YAxis tick={{ fontSize: 10 }} stroke="#737373" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '2px solid #171717', 
                    borderRadius: 0 
                  }} 
                />
                <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                  {(dailyStats?.modelData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Topics (if available) */}
      {dailyStats?.categoryData && dailyStats.categoryData.length > 0 && (
        <div className="brutal-card p-4">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Topik Paling Sering</h3>
          <div className="space-y-3">
            {dailyStats.categoryData
              .sort((a, b) => b.value - a.value)
              .map((item, index) => {
                const total = dailyStats.categoryData.reduce((sum, i) => sum + i.value, 0)
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-[#737373]">{item.value} ({percent}%)</span>
                    </div>
                    <div className="h-2 bg-[#F5F5F5] border border-[#E5E5E5]">
                      <div 
                        className="h-full bg-[#171717]" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
