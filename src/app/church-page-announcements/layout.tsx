import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./church-funnel.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  // Variable Inter so CSS weights 700–900 (and ~950) match funnel2.html
  variable: "--font-church-inter",
});

export const metadata: Metadata = {
  title: "Text2MySite for Churches | Church Announcements by Text",
  description:
    "Update church announcements instantly by text. Start a free 14-day Text2MySite Church Partner trial.",
  openGraph: {
    title: "Text2MySite for Churches | Church Announcements by Text",
    description:
      "Update church announcements instantly by text. Start a free 14-day Text2MySite Church Partner trial.",
    url: "https://www.text2mysite.com/church-page-announcements",
    siteName: "Text2MySite™",
    type: "website",
  },
};

export default function ChurchAnnouncementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // className applies the real next/font family; variable is used by church-funnel.css
  return (
    <div className={`${inter.variable} ${inter.className}`}>{children}</div>
  );
}
