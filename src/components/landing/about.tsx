"use client";
/* eslint-disable */


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export function About({
  footerRef,
  textVariants,
  buttonVariants,
}: Readonly<{ footerRef: any; textVariants: any; buttonVariants: any }>) {
  return (
    <motion.div
      ref={footerRef}
      className="w-full max-w-7xl mt-4 mx-auto px-4 sm:px-6 lg:px-8"
      variants={textVariants}
      id="about"
    >
      <Card className="rounded-[3em] bg-gradient-to-b from-background via-background to-muted border-none">

        <CardContent className="flex flex-col items-center justify-center gap-8 py-14 px-4 sm:px-10 text-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3 font-serif bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent">
             About Us
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
             Text2MySite is a breakthrough platform that allows small business owners to update their live websites just by sending a simple text message. Whether it’s posting holiday hours, announcing special offers, or adjusting your status for the day, Text2MySite makes it effortless — no dashboard, no login, no stress. Your message is sent, and your website is instantly updated.
            </p>
          </div>


         
        </CardContent>
      </Card>
    </motion.div>
  );
}
