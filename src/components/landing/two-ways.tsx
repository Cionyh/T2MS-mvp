"use client";

import { motion } from "framer-motion";
import { Globe, LayoutTemplate } from "lucide-react";

interface TwoWaysProps {
  readonly textVariants: any;
}

export function TwoWays({ textVariants }: TwoWaysProps) {
  return (
    <motion.section
      className="w-full max-w-6xl mx-auto px-4 md:px-8 py-12 sm:py-16"
      variants={textVariants}
      id="two-ways"
    >
      <div className="text-center mb-10">
        <h2 className="font-extrabold tracking-tight font-serif text-3xl sm:text-4xl md:text-5xl text-foreground bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent">
          Two ways to use T2MS
        </h2>
        <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Start with a standalone announcement page, add the website widget, or
          use both — every plan includes both options.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col items-center text-center gap-3 px-2">
          <Globe className="h-8 w-8 text-primary" aria-hidden />
          <h3 className="text-xl font-semibold text-foreground">
            Already have a website?
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base max-w-sm">
            Add the T2MS widget to it. Text updates from your phone and they
            appear live on your site.
          </p>
        </div>
        <div className="flex flex-col items-center text-center gap-3 px-2">
          <LayoutTemplate className="h-8 w-8 text-primary" aria-hidden />
          <h3 className="text-xl font-semibold text-foreground">
            Want a standalone announcement page?
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base max-w-sm">
            Your plan includes one. Share the link and start posting without
            installing anything on a website.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
