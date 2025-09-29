"use client";

import { motion, Variants } from "framer-motion";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer2";
import { Hero } from "@/components/landing/hero";
import { How } from "@/components/landing/how";
import { Title } from "@/components/landing/title";
import { About } from "@/components/landing/about";
import { Clients } from "@/components/landing/clients";
import { FAQSection } from "@/components/landing/FAQ";
import { CompatibilityCard } from "@/components/landing/co-card";
import { DemoPlaceholder } from "@/components/landing/demo";
import { LiveSandbox } from "@/components/landing/sandbox";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <About footerRef={footerRef} textVariants={textVariants} buttonVariants={buttonVariants} />
               <How  textVariants={textVariants}/> 

                             <LiveSandbox />
                             <CompatibilityCard />  
                             <Clients textVariants={textVariants}/>

                                <FAQSection />
                                
                                {/* Pricing CTA Section */}
                                <motion.section 
                                  className="w-full max-w-6xl mx-auto px-4 md:px-8 py-20"
                                  variants={textVariants}
                                >
                                  <div className="text-center">
                                    <h2 className="font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-serif mb-4">
                                      Ready to Get Started?
                                    </h2>
                                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                      Choose the perfect plan for your Text2MySite™ needs. 
                                      Start free and scale as you grow.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                      <Link href="/pricing">
                                        <Button size="lg" className="w-full sm:w-auto">
                                          View Pricing Plans
                                        </Button>
                                      </Link>
                                      <Link href="/app/build">
                                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                          Start Building
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                </motion.section>
      


      {/* Footer */}
      <Footer footerRef={footerRef}/>
              <Title />
    </motion.div>
        </div>

  );
}