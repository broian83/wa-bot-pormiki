'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Bot, Users, MessageSquare, Calendar, BookOpen, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001'

const COLORS = ['#171717', '#737373', '#E5E5E5', '#22C55E', '#3B82F6']

export default function HomePage() {
  const [stats, setStats] = useState(null)
  const [dailyStats, setDailyStats] = useState(null)
  const [botStatus, setBotStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [statsRes, dailyRes, statusRes] = await Promise.all([
        fetch(`${BOT_API_URL}/api/stats`),
        fetch(`${BOT_API_URL}/api/stats/daily`),
        fetch(`${BOT_API_URL}/api/status`)
      ])

      const statsData = await statsRes.json()
      const dailyData = await dailyRes.json()
      const statusData = await statusRes.json()

      setStats(statsData)
      setDailyStats(dailyData)
      setBotStatus(statusData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
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

  const statCards = [
    { 
      label: 'Total Chat', 
      value: stats?.totalChat || 0, 
      icon: MessageSquare,
      sublabel: `${stats?.todayChat || 0} hari ini`
    },
    { 
      label: 'Unique Users', 
      value: stats?.uniqueUsers || 0, 
      icon: Users,
      sublabel: 'Total pengguna'
    },
    { 
      label: 'AI Mode', 
      value: stats?.aiModeChat || 0, 
      icon: Bot,
      sublabel: 'Chat dijawab AI'
    },
    { 
      label: 'Admin Mode', 
      value: stats?.adminModeChat || 0, 
      icon: Users,
      sublabel: 'Chat dijawab admin'
    },
    { 
      label: 'Event Aktif', 
      value: stats?.activeEvents || 0, 
      icon: Calendar,
      sublabel: 'Event berjalan'
    },
    { 
      label: 'Knowledge', 
      value: stats?.totalKnowledge || 0, 
      icon: BookOpen,
      sublabel: 'Item aktif'
    },
  ]

  return (
    <DashboardLayout>
      {/* Bot Status Banner */}
      <div className={`mb-6 p-4 border-2 ${
        botStatus?.connected 
          ? 'border-[#22C55E] bg-[#F0FDF4]' 
          : 'border-[#EF4444] bg-[#FEF2F2]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              botStatus?.connected ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
            }`} />
            <div>
              <p className="font-semibold text-sm">
                {botStatus?.connected ? 'Bot Terhubung' : 'Bot Terputus'}
              </p>
              <p className="text-xs text-[#737373]">
                {botStatus?.connected ? 'Siap menerima pesan' : 'Silakan scan QR code'}
              </p>
            </div>
          </div>
          {!botStatus?.connected && (
            <a href="/qr" className="brutal-btn brutal-btn-primary text-sm">
              Scan QR
            </a>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="brutal-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-[#F5F5F5] border border-[#E5E5E5]">
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-[#737373] mt-1">{stat.label}</p>
              <p className="text-[10px] text-[#737373] mt-0.5">{stat.sublabel}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Daily Chat Chart */}
        <div className="brutal-card p-4">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Chat per Hari</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#737373" />
                <YAxis tick={{ fontSize: 10 }} stroke="#737373" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '2px solid #171717', 
                    borderRadius: 0 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#171717" 
                  strokeWidth={2}
                  dot={{ fill: '#171717', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
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
      </div>

      {/* Session Mode Chart */}
      <div className="brutal-card p-4">
        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Mode Sesi (AI vs Admin)</h3>
        <div className="h-64 max-w-md mx-auto">
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
              <Bar dataKey="value" fill="#171717" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  )
}
