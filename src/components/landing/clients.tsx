"use client";
/* eslint-disable */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Briefcase, ShoppingBag, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { LineShadowText } from "../magicui/line-shadow-text";

interface HowProps {
  readonly textVariants: any;
}

const steps = [
  {
    title: "Busy Business Owners",
    description:
      "Perfect for owners who want to update their site in seconds without logging into a dashboard.",
    icon: Briefcase,
    color: "from-pink-500 to-red-500",
  },
  {
    title: "Retail & Local Shops",
    description:
      "Quickly announce new arrivals, flash sales, or changes — right from your phone.",
    icon: ShoppingBag,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Restaurants & Cafés",
    description:
      "Easily update menus, daily specials, or important notices for your guests at any moment.",
    icon: Utensils,
    color: "from-emerald-500 to-lime-500",
  },
];

export function Clients({ textVariants }: HowProps) {
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  return (
    <motion.section
      id="clients"
      className="w-full max-w-7xl mx-auto px-4 md:px-10 py-20 my-10"
      variants={textVariants}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-16">
          <h2 className="font-extrabold bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent tracking-tight text-3xl sm:text-4xl md:text-5xl font-serif">
            
              Who It's For
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            T2MS is designed for busy business owners who need to update their websites quickly and easily.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="relative overflow-hidden rounded-3xl border-none backdrop-blur-lg bg-white/10 dark:bg-black/20 transition-transform hover:shadow-2xl group">
                  {/* Glowing gradient border */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-br opacity-75 group-hover:opacity-100 transition-opacity",
                      step.color
                    )}
                  >
                    <div className="h-full w-full rounded-3xl bg-background dark:bg-neutral-900"></div>
                  </div>

                  <CardHeader className="relative z-10 text-center pt-10 space-y-5">
                    {/* Animated icon ring */}
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      className={cn(
                        "w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg group-hover:scale-110 transition-transform",
                        step.color
                      )}
                    >
                      <Icon className="h-10 w-10" />
                    </motion.div>

                    <CardTitle className="text-2xl font-bold">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 px-6 pb-10 text-center">
                    <CardDescription className="text-base text-muted-foreground leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.section>
  );
}
