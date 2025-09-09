"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function DemoPlaceholder() {
  return (
    <section className="w-full bg-background py-20 flex flex-col items-center px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif text-center mb-4 bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent"
      >
        
      </motion.h2>
      <p className="text-base sm:text-xl text-muted-foreground text-center max-w-2xl mb-10">
        Watch a live demo of how sending a simple text updates your website instantly. 
      </p>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-lg border border-muted"
      >
      </motion.div>

    </section>
  );
}
