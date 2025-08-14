"use client";

import SignIn from "@/components/auth/sign-in";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion"; // Import Variants
import gsap from "gsap";
import { BorderBeam } from "@/components/magicui/border-beam";
import { RetroGrid } from "@/components/magicui/retro-grid";


const tabVariants: Variants = { 
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

export default function Page() {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP Animation on Mount
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
       <RetroGrid className="absolute inset-0 z-0" />
      <motion.div
        ref={containerRef}
        className="relative rounded-[3em] overflow-hidden md:w-[500px] w-full max-w-md bg-background p-6"
      >
        <Tabs defaultValue="sign-in" className="w-full rounded-[3em]">
          <TabsList className="grid w-full grid-cols-2 border-none rounded-[3em]">
            <TabsTrigger value="sign-in" className="data-[state=active]:bg-primary data-[state=active]:text-foreground rounded-[3em]">Sign In</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in" className="pt-2 border-none">
            <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <SignIn />
            </motion.div>
          </TabsContent>
        </Tabs>
                      <BorderBeam duration={8} size={100} />

      </motion.div>
    </div>
  );
}