import type { Metadata } from "next";
import { Inter, Crimson_Text } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toaster-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const crimson = Crimson_Text({
  subsets: ['latin'],
  variable: '--font-serif', 
  display: 'swap',
  weight: ['400', '600', '700'],
});


export const metadata: Metadata = {
  title: "T2MS",
  description: "Realtime website message delivery system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Basic Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.variable} ${crimson.variable} antialiased font-sans`}>
        <ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>

        {children}
        <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
