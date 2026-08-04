"use client";

import { SignUp } from "@/components/auth/sign-up";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import gsap from "gsap";
import { BorderBeam } from "@/components/magicui/border-beam";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { ReferralCapture } from "@/components/referral-capture";
import Link from "next/link";

const ONBOARDING_PLAN_STORAGE_KEY = "t2ms_onboarding_plan";

function SignUpPageContent() {
  const containerRef = useRef(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan === "church") {
      try {
        sessionStorage.setItem(ONBOARDING_PLAN_STORAGE_KEY, "church");
      } catch {
        // ignore
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative py-10">
      <ReferralCapture />
      <RetroGrid
        lightLineColor="orange"
        darkLineColor="orange"
        opacity={0.5}
        cellSize={15}
        className="absolute inset-0 z-0"
      />
      <motion.div
        ref={containerRef}
        className="relative rounded-[3em] overflow-hidden md:w-[500px] w-full max-w-md bg-transparent p-6"
      >
        <SignUp />
        <p className="mt-4 text-center text-sm text-muted-foreground relative z-10">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary underline underline-offset-4">
            Sign in
          </Link>
        </p>
        <BorderBeam duration={8} size={100} />
      </motion.div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignUpPageContent />
    </Suspense>
  );
}
