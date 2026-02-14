import { ReactNode } from "react";
import { WorkerGuard } from "@/components/auth/worker-guard";
import { WorkerLayoutShell } from "@/components/app/worker-layout-shell";

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return (
    <WorkerGuard>
      <WorkerLayoutShell>{children}</WorkerLayoutShell>
    </WorkerGuard>
  );
}
