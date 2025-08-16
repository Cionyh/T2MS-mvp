"use client";
/* eslint-disable */

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DotPattern } from "@/components/magicui/dot-pattern";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/admin/dashboard/clients", icon: Users },
 { label: "Sites", href: "/admin/dashboard/sites", icon: Database },
  { label: "Messages", href: "/admin/dashboard/messages", icon: MessageSquare },
  { label: "Analytics", href: "/admin/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
];

type ClientDashboardLayoutProps = {
  children: ReactNode;
  session: any;
};

export default function ClientDashboardLayout({
  children,
  session,
}: ClientDashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
       <DotPattern
  className={cn(
    "-z-50", 
    "[mask-image:radial-gradient(10000px_circle_at_center,white,transparent)]"
  )}
/>

      {/* Top Nav */}
      <header className="sticky top-0 z-40 w-full border-b bg-background px-4 py-3 flex justify-between items-center">
        {/* Left: Mobile Menu Trigger + Desktop Nav */}
        <div className="flex items-center gap-6">
          {/* Mobile Menu Button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <div className="space-y-4">
                <div className="text-lg font-semibold text-primary">T2MS Admin</div>
                <nav className="flex flex-col gap-2">
                  {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-primary"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Title + Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-lg font-semibold text-primary">T2MS Admin</div>
            <nav className="flex gap-4">
              {navItems.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right: Theme + Avatar */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage
                  src={session?.user.image || undefined}
                  alt={session?.user.name}
                />
                <AvatarFallback>
                  {session?.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session?.user.email}
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 px-4 sm:px-6 py-2 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
