import './globals.css'

export const metadata = {
  title: 'PORMIKI Bot Dashboard',
  description: 'Dashboard untuk mengelola WhatsApp Bot PORMIKI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
