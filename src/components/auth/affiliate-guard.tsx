"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardPathForRole, isAffiliateRole } from "@/lib/user-roles";

interface AffiliateGuardProps {
  children: ReactNode;
}

export function AffiliateGuard({ children }: AffiliateGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.id) {
      router.push("/sign-in");
      return;
    }

    if (!isAffiliateRole(session.user.role)) {
      router.push(getDashboardPathForRole(session.user.role));
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user || !isAffiliateRole(session.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
