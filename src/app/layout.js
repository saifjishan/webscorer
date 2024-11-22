import './globals.css'

export const metadata = {
  title: 'WebScorer',
  description: 'Track and analyze your scores',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}