"use client";

import { motion, Variants } from "framer-motion";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer2";
import { Hero } from "@/components/hero";
import { How } from "@/components/how";

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
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans">
      <Navbar />
    <motion.div
      className=" min-h-screen bg-[linear-gradient(135deg,var(--background)_85%,var(--primary)_85%)] flex flex-col items-center px-6 py-6 sm:px-10 sm:py-12 space-y-10 text-foreground"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Hero Section */}
      <Hero logoRef={logoRef} textVariants={textVariants} buttonVariants={buttonVariants}/>

      {/* How It Works Section */}
      <How  textVariants={textVariants}/>

      {/* Footer */}
      <Footer footerRef={footerRef} textVariants={textVariants} buttonVariants={buttonVariants}/>
    </motion.div>
        </div>

  );
}