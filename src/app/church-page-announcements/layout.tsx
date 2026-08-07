import type { Metadata } from "next";
import "./church-funnel.css";

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
  // No next/font Inter here: funnel2.html uses the system font stack
  // (Inter if installed, otherwise system-ui / SF Pro), not Google Fonts.
  return children;
}
