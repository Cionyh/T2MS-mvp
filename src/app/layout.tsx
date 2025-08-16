import type { Metadata } from "next";
import { Poppins, Lora } from 'next/font/google';
import "./globals.css";
import { ToastProvider } from "@/components/toaster-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/providers/query-provider";

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const lora = Lora({
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
      <body className={`${poppins.variable} ${lora.variable} antialiased font-sans`}>
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
  );
}
