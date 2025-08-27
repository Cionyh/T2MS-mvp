import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toaster-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import posthog from "@/lib/posthog";

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

// Enhanced SEO & Social Preview Metadata
export const metadata: Metadata = {
  title: "Text2MySite — Build & Update Your Site Instantly",
  description: "Text2MySite (T2MS) lets you manage and update your website content effortlessly. Try live demos, preview banners, modals, and more in real-time.",
  
  openGraph: {
    title: "Text2MySite — Build & Update Your Site Instantly",
    description: "Text2MySite (T2MS) lets you manage and update your website content effortlessly. Try live demos, preview banners, modals, and more in real-time.",
    url: "https://www.text2mysite.com/",
    siteName: "Text2MySite",
    images: [
      {
        url: "https://www.text2mysite.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Text2MySite Preview",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Text2MySite — Build & Update Your Site Instantly",
    description: "Text2MySite (T2MS) lets you manage and update your website content effortlessly. Try live demos, preview banners, modals, and more in real-time.",
    images: ["https://www.text2mysite.com/og-image.png"],
    site: "@YourTwitterHandle",
    creator: "@YourTwitterHandle",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
