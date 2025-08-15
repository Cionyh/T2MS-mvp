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
      className="w-full min-h-screen flex items-center justify-center px-4 pt-14 sm:pt-18 sm:px-6 mx-auto bg-background"
      variants={heroVariants}
      initial="hidden"
      animate="show"
    >
        
    <Card className="rounded-[3em] max-w-7xl bg-background border-muted  backdrop-blur-lg w-full min-h-screen overflow-auto pt-2">      
        
       <DotPattern
              className={cn(
                "-z-50", 
                "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
              )}
            />
  <CardHeader className="flex flex-col items-center gap-4 text-center py-12 px-4 sm:px-10">
    <h1
      ref={logoRef}
      className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-foreground tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent"
    >
      UPDATE YOUR WEBSITE WITH A <span className="text-primary">SIMPLE TEXT</span>
    </h1>
    <CardDescription className="text-base sm:text-lg max-w-2xl text-muted-foreground">
      Text2MySite (T2MS) lets small business owners easily update key sections of their websites by simply sending a text message. It's fast, smart, and doesn't require any tech skills. Just text and it's live.
    </CardDescription>
  </CardHeader>

  {/* Image and buttons container */}
  <div className="flex flex-col lg:flex-row items-center justify-center gap-4 px-4 sm:px-30">
    <div className="w-full max-w-xs flex justify-center px-4 mb-3">
      <Image
        src="/images/promotional.svg"
        alt="Promotional"
        width={0}
        height={0}
        sizes="10vw"
        className="w-full h-auto"
        priority
      />
    </div>

    <motion.div
      className="flex flex-col gap-4 w-full items-center"
      variants={buttonVariants}
    >
      <Button asChild size="lg" className="text-foreground w-full max-w-xs py-4">
        <Link href="/sign-in">Register Your Site</Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="w-full max-w-xs border-2 border-primary py-4">
        <Link href="/">Learn More</Link>
      </Button>
    </motion.div>
  </div>
  <CardFooter className="pb-10" />
</Card>     
    </motion.div>
    
  );
}
