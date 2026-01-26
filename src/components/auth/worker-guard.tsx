"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WorkerGuardProps {
  children: ReactNode;
}

export function WorkerGuard({ children }: WorkerGuardProps) {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isWorker, setIsWorker] = useState(false);

  useEffect(() => {
    async function checkWorker() {
      if (sessionLoading) return;

      if (!session?.user?.id) {
        router.push("/sign-in");
        return;
      }

      try {
        const response = await fetch("/api/workers/me");
        if (response.ok) {
          setIsWorker(true);
        } else {
          // Not a worker, redirect to regular app
          router.push("/app");
        }
      } catch (error) {
        console.error("Error checking worker status:", error);
        router.push("/app");
      } finally {
        setChecking(false);
      }
    }

    checkWorker();
  }, [session, sessionLoading, router]);

  if (sessionLoading || checking) {
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

  if (!isWorker) {
    return null; // Redirecting
  }

  return <>{children}</>;
}
