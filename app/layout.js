import './globals.css';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'zShow - Streaming Platform',
  description: 'Watch your favorite movies and TV shows',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        
        {/* Script publicitaire Adsterra (Popunder / Social Bar) */}
        <Script 
          src="https://environmenttalentrabble.com/68/12/fd/6812fd2ddecf93fdec55c8887f83a17c.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  )
}