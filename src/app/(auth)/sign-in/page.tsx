"use client";

import SignIn from "@/components/auth/sign-in";
import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import gsap from "gsap";
import { BorderBeam } from "@/components/magicui/border-beam";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { ReferralCapture } from "@/components/referral-capture";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer2";
import Link from "next/link";

function SignInPageContent() {
  const containerRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Back-compat: old combined page used ?tab=sign-up
  useEffect(() => {
    if (searchParams.get("tab") !== "sign-up") return;
    const ref = searchParams.get("ref");
    const qs = ref ? `?ref=${encodeURIComponent(ref)}` : "";
    router.replace(`/signup${qs}`);
  }, [searchParams, router]);

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
    <div className="min-h-screen flex flex-col bg-background relative">
      <ReferralCapture />
      <Navbar />
      <div className="flex-1 flex items-center justify-center relative pt-24 pb-12">
        <RetroGrid
          lightLineColor="orange"
          darkLineColor="orange"
          opacity={0.5}
          cellSize={15}
          className="absolute inset-0 z-0"
        />
        <motion.div
          ref={containerRef}
          className="relative z-10 rounded-[3em] overflow-hidden md:w-[500px] w-full max-w-md bg-transparent p-6"
        >
          <SignIn />
          <p className="mt-4 text-center text-sm text-muted-foreground relative z-10">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
          <BorderBeam duration={8} size={100} />
        </motion.div>
      </div>
      <Footer />
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
