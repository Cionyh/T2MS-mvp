"use client";

import { motion, Variants } from "framer-motion";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer2";
import { Hero } from "@/components/hero";
import { How } from "@/components/how";
import { Title } from "@/components/title";

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
      { scale: 0.8, opacity: 0, y: 20 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.1,
      }
    );

    gsap.fromTo(
      footerRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.6,
      }
    );
  }
}, []);


  return (
    <div className="relative w-full overflow-hidden bg-background font-sans">
      <Navbar />
    <motion.div
      className="min-h-screen bg-gradient-t-b from-background via-background to-muted flex flex-col items-center px-0 py-2 sm:px-0 sm:py-2 space-y-2 text-foreground"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Hero Section */}
      <Hero logoRef={logoRef} textVariants={textVariants} buttonVariants={buttonVariants}/>

      {/* How It Works Section */}
      <How  textVariants={textVariants}/>


      <Title />



      {/* Footer */}
      <Footer footerRef={footerRef} textVariants={textVariants} buttonVariants={buttonVariants}/>
    </motion.div>
        </div>

  );
}