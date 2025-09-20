"use client";
/* eslint-disable */

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Globe,
  MessageSquare,
  LogOut,
  LucideSettings,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DotPattern } from "@/components/magicui/dot-pattern";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { signOut, client } from "@/lib/auth-client"; 

const navItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Sites", href: "/app/sites", icon: Globe },
  { label: "Messages", href: "/app/messages", icon: MessageSquare },
  { label: "Billing", href: "/app/billing", icon: CreditCard },
  { label: "Settings", href: "/app/settings", icon: LucideSettings },
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
  const [openSignOutDialog, setOpenSignOutDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [planStatus, setPlanStatus] = useState<string>("");

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await client.subscription.list({
          query: {
            referenceId: session?.user?.id
          }
        });
        
        if (data && data.length > 0) {
          const activeSubscription = data.find((sub: any) => 
            sub.status === "active" || sub.status === "trialing"
          );
          
          if (activeSubscription) {
            setCurrentPlan(activeSubscription.plan);
            setPlanStatus(activeSubscription.status);
          }
        }
      } catch (error) {
        // Silently fail - user might not have subscriptions
        console.log("No subscription found");
      }
    };

    if (session?.user?.id) {
      fetchSubscription();
    }
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setOpenSignOutDialog(false);
      window.location.href = "/sign-in";
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

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
        {/* Left: Mobile Menu + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <div className="space-y-4">
                <div className="text-lg font-semibold text-primary">T2MS</div>
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

          <div className="hidden md:flex items-center gap-6">
            <div className="text-lg font-semibold text-primary">T2MS</div>
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

        {/* Right: Plan Badge + Theme + Avatar + Sign Out */}
        <div className="flex items-center gap-3">
          {/* Plan Badge with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Badge 
                variant={currentPlan === "free" ? "secondary" : "default"}
                className={cn(
                  "cursor-pointer transition-colors",
                  currentPlan === "free" && "bg-muted text-muted-foreground",
                  currentPlan === "starter" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                  currentPlan === "pro" && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                  currentPlan === "enterprise" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                )}
              >
                {currentPlan === "free" ? "Free" : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                {planStatus === "trialing" && " (Trial)"}
              </Badge>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Current Plan: {currentPlan === "free" ? "Free" : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentPlan === "free" && "Limited features and usage"}
                  {currentPlan === "starter" && "Basic features with moderate limits"}
                  {currentPlan === "pro" && "Advanced features with higher limits"}
                  {currentPlan === "enterprise" && "Full features with unlimited usage"}
                </p>
                
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/app/billing">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Billing
                    </Button>
                  </Link>
                  
                  {currentPlan !== "enterprise" && (
                    <Link href="/#pricing">
                      <Button size="sm" className="w-full">
                        {currentPlan === "free" ? "Upgrade Plan" : "Upgrade Plan"}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
            <PopoverContent align="end" className="w-64 space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session?.user.email}
                </p>

                {/* Sign Out Button */}
                <Dialog open={openSignOutDialog} onOpenChange={setOpenSignOutDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start flex items-center gap-2 mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Sign Out</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to sign out?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenSignOutDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSignOut}>Sign Out</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
