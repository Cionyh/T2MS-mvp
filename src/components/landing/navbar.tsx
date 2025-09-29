'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import posthog from '@/lib/posthog'; // <-- import PostHog

type NavLink = {
  label: string;
  href: string;
};

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQs', href: '#faqs' },
  { label: 'Tutorials', href: '/docs' },
  { label: 'About', href: '#about' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  const FADE_UP_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-background/40 backdrop-blur-sm border-b border-muted shadow-xs rounded-b-[3em]">
      <div className="container flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold text-foreground">
          <motion.p
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-xl font-extrabold tracking-tighter sm:text-xl md:text-2xl lg:text-3xl font-serif"
          >
            <span className="text-primary [text-shadow:0_0_20px_theme(colors.primary/20%)]">
              Text2MySite<span className='text-sm'>™</span>
            </span>
          </motion.p>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/sign-in">
            <Button
              className="bg-primary text-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-sm transition-colors"
              onClick={() => posthog.capture("sign_in_click")}
            >
              Sign In
            </Button>
          </Link>
        </nav>

        {/* Mobile Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-screen sm:w-80 p-6 flex flex-col">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>

              <nav className="flex flex-col space-y-4 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-4 border-t border-border">
                <Link href="/sign-in">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
                    onClick={() => posthog.capture("sign_in_click")}
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
