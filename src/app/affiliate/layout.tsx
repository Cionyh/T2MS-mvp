import { ReactNode } from "react";
import { AffiliateGuard } from "@/components/auth/affiliate-guard";
import { AffiliateLayoutShell } from "@/components/app/affiliate-layout-shell";

export const metadata = {
  title: "Affiliate | T2MS",
  description: "Affiliate dashboard for T2MS",
};

export default function AffiliateLayout({ children }: { children: ReactNode }) {
  return (
    <AffiliateGuard>
      <AffiliateLayoutShell>{children}</AffiliateLayoutShell>
    </AffiliateGuard>
  );
}
