import type { Metadata } from "next";
import { Source_Serif_4, DM_Sans } from "next/font/google";
import "./church-pricing.css";

const display = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--church-price-display",
});

const sans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--church-price-sans",
});

export const metadata: Metadata = {
  title: "Church Partner Pricing | Text2MySite™",
  description:
    "Special Text2MySite Church Partner intro pricing for verified churches and religious organizations. Free 14-day trial, price locked for up to 3 years.",
  openGraph: {
    title: "Church Partner Pricing | Text2MySite™",
    description:
      "Special intro pricing for churches — update announcements by text. Free 14-day trial.",
    url: "https://www.text2mysite.com/church-pricing",
    siteName: "Text2MySite™",
    type: "website",
  },
};

export default function ChurchPricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${display.variable} ${sans.variable}`}>{children}</div>
  );
}
