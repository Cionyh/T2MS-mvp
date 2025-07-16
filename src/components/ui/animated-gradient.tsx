// File: components/ui/animated-gradient-background.tsx
"use client";

import { motion } from "framer-motion";

export const AnimatedGradientBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
      {/* First Orb */}
      <motion.div
        className="absolute h-[30rem] w-[30rem] rounded-full bg-primary"
        style={{ top: '5%', left: '10%' }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 60, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
      {/* Second Orb */}
      <motion.div
        className="absolute h-[25rem] w-[25rem] rounded-full bg-primary"
        style={{ bottom: '10%', right: '15%' }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -30, 0],
          rotate: [0, -120, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
          delay: 5, // Start at a different time
        }}
      />
       {/* Third Orb - for more color depth */}
      <motion.div
        className="absolute h-[20rem] w-[20rem] rounded-full bg-background"
        style={{ bottom: '40%', left: '25%' }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          rotate: [0, 90, -180],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 35,
          ease: "circInOut",
          repeat: Infinity,
          repeatType: "mirror",
          delay: 10,
        }}
      />

      {/* A blur overlay to create the soft gradient effect */}
      <div className="absolute inset-0 backdrop-filter backdrop-blur-3xl"></div>
    </div>
  );
};