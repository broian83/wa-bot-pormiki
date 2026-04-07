'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, MessageSquare, BookOpen, BarChart3, QrCode, 
  Menu, X, ChevronLeft, ChevronRight, Settings, LogOut 
} from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Knowledge', href: '/knowledge', icon: BookOpen },
  { name: 'Stats', href: '/stats', icon: BarChart3 },
  { name: 'QR Code', href: '/qr', icon: QrCode },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex fixed top-0 left-0 h-full bg-white border-r-2 border-[#E5E5E5] flex-col transition-all duration-200 z-40 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="p-4 border-b-2 border-[#E5E5E5] flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-lg font-bold tracking-tight">PORMIKI BOT</h1>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-[#F5F5F5] border border-[#E5E5E5]"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 transition-all ${
                  isActive 
                    ? 'bg-[#171717] text-white' 
                    : 'text-[#737373] hover:bg-[#F5F5F5] hover:text-[#171717]'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t-2 border-[#E5E5E5]">
          <button className="flex items-center gap-3 w-full px-2 py-2 text-[#737373] hover:text-[#171717] transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-64 h-full bg-white border-r-2 border-[#E5E5E5] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b-2 border-[#E5E5E5] flex items-center justify-between">
              <h1 className="text-lg font-bold tracking-tight">PORMIKI BOT</h1>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 transition-all ${
                      isActive 
                        ? 'bg-[#171717] text-white' 
                        : 'text-[#737373] hover:bg-[#F5F5F5]'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        {/* Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b-2 border-[#E5E5E5] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-1 border border-[#E5E5E5]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
              {navItems.find(n => n.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#171717] flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E5E5E5] flex justify-around py-2 z-40">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 ${
                  isActive ? 'text-[#171717]' : 'text-[#737373]'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
