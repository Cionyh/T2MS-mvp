"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function StatusPage() {
  const componentsStatus = [
    { name: "Website", status: "operational" },
    { name: "API", status: "operational" },
    { name: "Database", status: "operational" },
    { name: "Messaging Service", status: "operational" },
  ];

  const statusColor = (status: string) =>
    status === "operational" ? "text-green-600" : "text-red-600";

  const statusIcon = (status: string) =>
    status === "operational" ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
      <motion.h1
        className="text-4xl font-extrabold mb-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        System Status
      </motion.h1>
      <motion.p
        className="text-lg text-muted-foreground mb-12 text-center max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        All systems are currently operational. This is a placeholder status page.
      </motion.p>

      <div className="w-full max-w-md space-y-4">
        {componentsStatus.map((comp) => (
          <motion.div
            key={comp.name}
            className="flex items-center justify-between bg-muted/10 p-4 rounded-xl shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-medium">{comp.name}</span>
            <div className="flex items-center gap-2">
              {statusIcon(comp.status)}
              <span className={`font-semibold ${statusColor(comp.status)}`}>
                {comp.status.charAt(0).toUpperCase() + comp.status.slice(1)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <Link href="/" className="mt-12">
        <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
          Back to Home
        </button>
      </Link>
    </main>
  );
}
