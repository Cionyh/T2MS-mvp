"use client";
/* eslint-disable */


import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
 { label: "Dashboard", href: "/app" },
  { label: "Sites", href: "/app/sites" },
  { label: "Messages", href: "/app/messages" },
];

export default function ClientDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // ⬅️ desktop sidebar state

  return (
    <div className="flex min-h-screen bg-muted/40 flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background border-b">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent pathname={pathname} closeSheet={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Avatar>
            <AvatarImage src="https://avatar.vercel.sh/user" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-background border-r shadow-sm transition-all duration-300",
          sidebarOpen ? "w-64 px-4 py-6" : "w-16 items-center py-6"
        )}
      >
        <SidebarContent pathname={pathname} collapsed={!sidebarOpen} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b px-4 py-4 items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Avatar>
              <AvatarImage src="https://avatar.vercel.sh/user" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {children}
        </section>
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  closeSheet,
  collapsed = false,
}: Readonly<{
  pathname: string;
  closeSheet?: () => void;
  collapsed?: boolean;
}>) {
  return (
    <>
      <Link
        href="/app"
        className={cn(
          "text-primary font-bold text-xl px-6 py-3 mb-4 transition-all",
          collapsed ? "text-sm px-0 text-center" : "block"
        )}
        onClick={closeSheet}
      >
        {"T2MS"}
      </Link>

      <nav className={cn("flex flex-col gap-1", collapsed && "items-center")}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md transition-colors text-sm font-medium px-3 py-2 w-full",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-primary",
              collapsed && "text-xs px-2 py-1 text-center"
            )}
            onClick={closeSheet}
          >
            {collapsed ? item.label.charAt(0) : item.label}
          </Link>
        ))}
      </nav>

    </>
  );
}
