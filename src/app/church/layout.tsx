import type { Metadata } from "next";
import "./church-faith.css";

export const metadata: Metadata = {
  title: "Text2MySite™ | Church Communications",
  description:
    "Keep your congregation informed with church announcements updated by text message. No website editing required.",
  openGraph: {
    title: "Text2MySite™ | Church Communications",
    description:
      "Keep your congregation informed with church announcements updated by text message.",
    url: "https://www.text2mysite.com/church",
    siteName: "Text2MySite™",
    type: "website",
  },
};

export default function ChurchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
