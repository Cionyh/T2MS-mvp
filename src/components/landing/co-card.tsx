"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Plus } from "lucide-react";

export function CompatibilityCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="relative overflow-hidden rounded-4xl p-6 sm:p-10 lg:p-16 bg-gradient-to-br from-background via-background to-background border-b-2 border-b-muted border-l-2 border-l-muted text-foreground my-6 mx-4 sm:mx-8 lg:mx-auto"
    >
      {/* Animated light streak */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent w-full"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h3 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent font-serif">
          Compatible with Your Tools
        </h3>

        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10">
          Add your updates to any site in seconds without touching backend code.
        </p>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
          {/* WordPress */}
          <div className="flex items-center bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-none">
            <Image
              src="/images/wp.svg"
              alt="WordPress"
              width={32}
              height={32}
              className="h-9 w-9 sm:h-12 sm:w-12"
            />
          </div>

          {/* Wix */}
          <div className="flex items-center bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-none">
            <Image
              src="/images/wix.svg"
              alt="Wix"
              width={32}
              height={32}
              className="h-9 w-9 sm:h-12 sm:w-12"
            />
          </div>

          {/* Shopify */}
          <div className="flex items-center bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-none">
            <Image
              src="/images/shopify.svg"
              alt="Shopify"
              width={32}
              height={32}
              className="h-9 w-9 sm:h-12 sm:w-12"
            />
          </div>

          {/* Squarespace */}
          <div className="flex items-center bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-none">
            <Image
              src="/images/ss.svg"
              alt="Squarespace"
              width={32}
              height={32}
              className="h-9 w-9 sm:h-12 sm:w-12"
            />
          </div>

          <div className="flex items-center bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-none">
            <Image
              src="/images/gd.svg"
              alt="Squarespace"
              width={32}
              height={32}
              className="h-9 w-9 sm:h-12 sm:w-12"
            />
          </div>
          <div className="flex items-center bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-none">
            <Image
              src="/images/joomla.svg"
              alt="Squarespace"
              width={32}
              height={32}
              className="h-9 w-9 sm:h-12 sm:w-12"
            />
          </div>

          {/* "And More" */}
          <div className="flex items-center bg-muted border border-primary rounded-full px-4 sm:px-6 py-2 sm:py-3">
            <Plus className="h-3 sm:h-4 w-4 sm:w-5" />
            <span className="font-semibold text-base sm:text-lg ml-2">
              and More
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
