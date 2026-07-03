import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./announce.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Text2MySite Announcement Pages",
  description:
    "Keep people informed — directly from your phone. Live announcement pages and website widgets updated instantly by text message.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function AnnounceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={inter.className}>{children}</div>;
}
