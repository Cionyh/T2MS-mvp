import { ReactNode } from "react";
import { WorkerGuard } from "@/components/auth/worker-guard";

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return <WorkerGuard>{children}</WorkerGuard>;
}
