import type { Metadata } from "next"
import { Poppins, Lora } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/toaster-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/lib/providers/query-provider"

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  title: "T2MS Hosted",
  description: "Hosted Text2MySite application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${lora.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
