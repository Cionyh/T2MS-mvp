"use client";
/* eslint-disable */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { DotPattern } from "../magicui/dot-pattern";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import posthog from "@/lib/posthog"; // <-- import PostHog

export function Hero({
  logoRef,
  textVariants,
  buttonVariants,
}: Readonly<{
  logoRef: any;
  textVariants: any;
  buttonVariants: any;
}>) {
  const { theme } = useTheme(); // Get current theme: 'light', 'dark', or undefined
  const heroVariants: Variants = {
    hidden: { opacity: 0, y: -50 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeInOut",
      },
    },
  };

  const logoSrc = theme === "dark" ? "/images/logo_dark.png" : "/images/logo_light.png";

  return (
    <motion.div
      className="w-full min-h-screen flex items-center justify-center px-4 pt-14 sm:pt-18 sm:px-6 mx-auto bg-background"
      variants={heroVariants}
      initial="hidden"
      animate="show"
    >
      <Card className="rounded-[3em] max-w-7xl bg-background border-muted backdrop-blur-lg w-full min-h-screen overflow-auto pt-2">
        <DotPattern
          glow={true}
          height={20}
          width={20}
          className={cn(
            "-z-50",
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
          )}
        />
        <CardHeader className="flex flex-col items-center gap-4 text-center py-12 px-4 sm:px-10">
          <h1
            ref={logoRef}
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-foreground tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent"
          >
            Your Website.<br />{" "}
            <span className="text-primary">Updated Instantly.</span>
            <span className="text-foreground"> Just Text.</span>
          </h1>
          <CardDescription className="text-base sm:text-lg max-w-2xl text-muted-foreground">
          Text2MySite lets small business owners easily update key sections of their website by simply sending a tet message.  It's fast, smart, and doesn't require any tech skills.  Just text and it's live.          </CardDescription>
        </CardHeader>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 px-4 sm:px-8">
          <div className="w-full flex justify-center px-4 mb-2">
            <Image
              src={logoSrc}
              alt="Text2MySite Logo"
              width={400}
              height={400}
              sizes="(max-width: 768px) 80vw, (max-width: 1000px) 40vw, 400px"
              className="w-full h-auto max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] object-contain"
              priority
            />
          </div>

          <motion.div
            className="flex flex-col gap-4 w-full items-center"
            variants={buttonVariants}
          >
            <Button
              asChild
              size="lg"
              className="text-foreground w-full max-w-xs py-4"
              onClick={() => posthog.capture("register_site_click")}
            >
              <Link href="/sign-in">Register Your Site</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full max-w-xs border-2 border-primary py-4"
              onClick={() => posthog.capture("learn_more_click")}
            >
              <Link href="/learn-more">Learn More</Link>
            </Button>
          </motion.div>
        </div>

        <CardFooter className="pb-10" />
      </Card>
    </motion.div>
  );
}
