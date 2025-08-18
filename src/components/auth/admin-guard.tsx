"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

type AdminGuardProps = {
  children: ReactNode;
};

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/login");
      } else if (session.user.role !== "admin") {
        router.push("/not-authorized");
      }
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return <div>Loading…</div>;
  }

  return <>{children}</>;
}
