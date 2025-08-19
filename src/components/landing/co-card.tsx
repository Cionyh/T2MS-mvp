"use client";

import { motion } from "framer-motion";
import { Globe, Webhook, Layout, Server, Plus, Facebook } from "lucide-react";

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
          <div className="flex items-center gap-2 sm:gap-3 bg-red-400 rounded-full px-4 sm:px-6 py-2 sm:py-3">
            <Webhook className="h-5 sm:h-6 w-5 sm:w-6" />
            <span className="font-semibold text-base sm:text-lg">WordPress</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-purple-500 rounded-full px-4 sm:px-6 py-2 sm:py-3">
            <Layout className="h-5 sm:h-6 w-5 sm:w-6" />
            <span className="font-semibold text-base sm:text-lg">Wix</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-green-500 rounded-full px-4 sm:px-6 py-2 sm:py-3">
            <Server className="h-5 sm:h-6 w-5 sm:w-6" />
            <span className="font-semibold text-base sm:text-lg">GoDaddy</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-yellow-500 rounded-full px-4 sm:px-6 py-2 sm:py-3">
            <Globe className="h-5 sm:h-6 w-5 sm:w-6" />
            <span className="font-semibold text-base sm:text-lg">Joomla</span>
          </div>
          {/* New Facebook compatibility item */}
          <div className="flex items-center gap-2 sm:gap-3 bg-blue-500 rounded-full px-4 sm:px-6 py-2 sm:py-3">
            <Facebook className="h-5 sm:h-6 w-5 sm:w-6" />
            <span className="font-semibold text-base sm:text-lg">Facebook</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-muted border-2 border-primary rounded-full px-4 sm:px-6 py-2 sm:py-3">
            <Plus className="h-5 sm:h-6 w-5 sm:w-6" />
            <span className="font-semibold text-base sm:text-lg">and More</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
