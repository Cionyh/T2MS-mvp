import type { Metadata } from "next";
import "./church-funnel.css";
import { getChurchFunnelPublicUrl } from "@/lib/church-funnel";

export const metadata: Metadata = {
  title: "Church Page Announcements | Text2MySite",
  description:
    "Update church announcements instantly by text. Start a free 14-day Text2MySite Church Partner trial.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Church Page Announcements | Text2MySite",
    description:
      "Update church announcements instantly by text. Start a free 14-day Text2MySite Church Partner trial.",
    url: getChurchFunnelPublicUrl(),
  },
};

export default function ChurchFunnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
