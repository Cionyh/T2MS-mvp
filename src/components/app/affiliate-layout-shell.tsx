"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/affiliate/dashboard", icon: LayoutDashboard },
];

function getUserInitials(name: string) {
  if (!name) return "A";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function AffiliateLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/sign-in";
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/affiliate/dashboard" className="text-lg font-semibold text-primary">
            T2MS Affiliate
          </Link>
          <nav className="hidden md:flex gap-4">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-2",
                  pathname === href ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name} />
                  <AvatarFallback>{getUserInitials(session?.user?.name || "")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{session?.user?.email}</p>
              </div>
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">{children}</main>
    </div>
  );
}
