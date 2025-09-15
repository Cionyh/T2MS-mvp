"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer2";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsHeader } from "@/components/docs/docs-header";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

interface DocsLayoutProps {
  children: ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex min-h-screen pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border bg-muted/20">
          <DocsSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="relative">
            <DotPattern
              className={cn(
                "-z-50",
                "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]"
              )}
            />
            
            <div className="container mx-auto px-4 py-8">
              <DocsHeader />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                {children}
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
