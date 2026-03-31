"use client";

import SignIn from "@/components/auth/sign-in";
import { SignUp } from "@/components/auth/sign-up";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, Variants } from "framer-motion"; // Import Variants
import gsap from "gsap";
import { BorderBeam } from "@/components/magicui/border-beam";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { ReferralCapture } from "@/components/referral-capture";


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

function SignInPageContent() {
  const containerRef = useRef(null);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "sign-up" ? "sign-up" : "sign-in";

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
       <ReferralCapture />
       <RetroGrid lightLineColor="orange" darkLineColor="orange" opacity={0.5} cellSize={15} className="absolute inset-0 z-0" />
      <motion.div
        ref={containerRef}
        className="relative rounded-[3em] overflow-hidden md:w-[500px] w-full max-w-md bg-transparent p-6"
      >
        <Tabs defaultValue={defaultTab} className="w-full rounded-[3em]">
          <TabsList className="grid w-full grid-cols-2 border-none rounded-[3em]">
            <TabsTrigger value="sign-in" className="data-[state=active]:bg-primary data-[state=active]:text-foreground rounded-[3em]">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up" className="data-[state=active]:bg-primary data-[state=active]:text-foreground rounded-[3em]">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in" className="pt-2 border-none">
            <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <SignIn />
            </motion.div>
          </TabsContent>
          <TabsContent value="sign-up" className="pt-2">
            <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <SignUp />
            </motion.div>
          </TabsContent>
        </Tabs>
                      <BorderBeam duration={8} size={100} />

      </motion.div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}