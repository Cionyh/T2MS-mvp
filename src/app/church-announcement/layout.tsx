import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./church-funnel.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Text2MySite for Churches | Church Announcements by Text",
  description:
    "Update church announcements instantly by text. Start a free 14-day Text2MySite Church Partner trial.",
  openGraph: {
    title: "Text2MySite for Churches | Church Announcements by Text",
    description:
      "Update church announcements instantly by text. Start a free 14-day Text2MySite Church Partner trial.",
    url: "https://www.text2mysite.com/church-announcement",
    siteName: "Text2MySite™",
    type: "website",
  },
};

export default function ChurchAnnouncementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={inter.className}>{children}</div>;
}
