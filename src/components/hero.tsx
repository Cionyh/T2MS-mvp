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


export function Hero({
  logoRef,
  textVariants,
  buttonVariants,
}: Readonly<{
  logoRef: any;
  textVariants: any;
  buttonVariants: any;
}>) {
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

  return (
    <motion.div
      className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 mx-auto"
      variants={heroVariants}
      initial="hidden"
      animate="show"
    >
    <Card className="rounded-[3em] max-w-7xl bg-[linear-gradient(50deg,var(--muted)_85%,var(--primary)_85%)] backdrop-blur-lg border-none w-full min-h-screen overflow-auto pt-2">
  <CardHeader className="flex flex-col items-center gap-4 text-center py-12 px-4 sm:px-10">
    <h1
      ref={logoRef}
      className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight"
    >
      Introducing T<span className="text-primary">2</span>MS
    </h1>
    <CardDescription className="text-base sm:text-lg max-w-2xl text-muted-foreground">
      Update your website by sending a text. Instantly show popups, banners, or alerts — no code, no login, no delay.
    </CardDescription>
  </CardHeader>

  {/* Image and buttons container */}
  <div className="flex flex-col lg:flex-row items-center justify-center gap-4 px-4 sm:px-30">
    <div className="w-full max-w-xs flex justify-center px-4 mb-6">
      <Image
        src="/images/promotional.svg"
        alt="Promotional"
        width={0}
        height={0}
        sizes="30vw"
        className="w-full h-auto"
        priority
      />
    </div>

    <motion.div
      className="flex flex-col gap-4 w-full items-center"
      variants={buttonVariants}
    >
      <Button asChild size="lg" className="text-foreground w-full max-w-xs">
        <Link href="/sign-in">Register Your Site</Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="w-full max-w-xs">
        <Link href="/">Learn More</Link>
      </Button>
    </motion.div>
  </div>
  <CardFooter className="pb-10" />
</Card>     
    </motion.div>
    
  );
}
