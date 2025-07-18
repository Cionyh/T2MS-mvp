"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Rocket, MessageSquare, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.2 } },
};

const textVariants: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const buttonVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: "backOut" } },
};

export default function Home() {
  const logoRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    if (logoRef.current && footerRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0, rotation: 180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: "backOut" }
      );

      gsap.fromTo(
        footerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <motion.div
      className=" min-h-screen bg-[linear-gradient(135deg,var(--background)_85%,var(--primary)_85%)] flex flex-col items-center px-6 py-6 sm:px-10 sm:py-12 space-y-10 text-foreground"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Hero Section */}
      <motion.div className="w-full max-w-8xl" variants={textVariants}>
        <Card className="rounded-[3em]">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <p
              ref={logoRef}
              className="text-6xl font-extrabold flex items-center text-primary"
            >
              T<span className="text-foreground">2</span>MS
            </p>
            <CardDescription className="text-lg max-w-xl text-muted-foreground">
              Update your website by sending a text. Instantly show popups, banners, or alerts
              — no code, no login, no delay.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <motion.div className="flex flex-col sm:flex-row gap-4" variants={buttonVariants}>
              <Button asChild size="lg" className="text-foreground">
                <Link href="/sign-in">Register Your Site</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/learn-more">Learn More</Link>
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* How It Works Section */}
      <motion.div className="w-full max-w-8xl" variants={textVariants}>
        <Card className="rounded-[3em]">
          <CardHeader>
            <CardTitle className="text-4xl font-bold">How It Works</CardTitle>
            <CardDescription>
              Send a message. We deliver it to your site — in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Step 1 */}
              <Card className="bg-muted/40">
                <CardHeader>
                  <Rocket className="h-20 w-20 mb-2 text-primary" />
                  <CardTitle className="text-4xl font-bold">Send a Text</CardTitle>
                  <CardDescription className="text-sm">
                    Send a message from your registered phone number.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Step 2 */}
              <Card className="bg-muted/40">
                <CardHeader>
                  <MessageSquare className="h-20 w-20 mb-2 text-primary" />
                  <CardTitle className="text-4xl font-bold">We Match It</CardTitle>
                  <CardDescription className="text-sm">
                    We link your text to your connected site automatically.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Step 3 */}
              <Card className="bg-muted/40">
                <CardHeader>
                  <Globe className="h-20 w-20 mb-2 text-primary" />
                  <CardTitle className="text-4xl font-extrabold">Display Instantly</CardTitle>
                  <CardDescription className="text-sm">
                    Your message shows live on your site as a banner or popup or fullscreen.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div className="w-full max-w-8xl px-4" variants={textVariants}>
        <Card className="rounded-[3em] bg-muted/50 shadow-md border-none">
          <CardContent className="flex flex-col items-center justify-center gap-6 py-10 text-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                Ready to simplify your website updates?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                Text2MySite lets you update your site with a simple SMS. No login, no hassle.
              </p>
            </div>

            <motion.div className="flex flex-col sm:flex-row gap-4" variants={buttonVariants}>
              <Button asChild size="lg" className="text-foreground">
                <Link href="/sign-in">Register Your Site</Link>
              </Button>
            </motion.div>

            <div className="flex flex-col items-center w-full">
              <div className="text-xs text-muted-foreground pt-6 border-t border-border w-full">
                © {new Date().getFullYear()} Text2MySite. All rights reserved.
              </div>
              <div className="pt-2">
                <ThemeToggle />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}