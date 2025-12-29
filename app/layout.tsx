import type React from "react"
import type { Metadata } from "next"
import { Press_Start_2P, Geist } from "next/font/google"
import "./globals.css"

const _pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
})

const _geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skee Ball - Carnival Arcade",
  description: "Play Skee Ball at the carnival arcade!",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_pressStart.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
