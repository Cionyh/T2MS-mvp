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
import { Rocket, MessageSquare, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface HowProps {
  readonly textVariants: any;
}

const steps = [
  {
    title: "Send a Text",
    description: "Send a message from your registered phone number.",
    icon: Rocket,
    color: "from-pink-500 to-red-500",
  },
  {
    title: "We Match It",
    description: "We link your text to your connected site automatically.",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Display Instantly",
    description:
      "Your message shows live on your site as a banner, popup, or fullscreen.",
    icon: Globe,
    color: "from-emerald-500 to-lime-500",
  },
];

export function How({ textVariants }: HowProps) {
  return (
    <motion.section
      id="how"
      className="w-full max-w-14xl mx-auto px-4 md:px-10 py-20"
      variants={textVariants}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <Card className="rounded-[3em] bg-gradient-to-b from-background via-background to-primary border-none backdrop-blur-md py-20">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-5xl font-extrabold tracking-tight">
              How It Works
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Send a message. We deliver it to your site — in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="bg-muted/40 hover:bg-muted/60 transition-colors duration-300 rounded-3xl shadow-md h-full">
                      <CardHeader className="text-center space-y-4">
                        <div
                          className={cn(
                            "w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg",
                            step.color
                          )}
                        >
                          <Icon className="h-10 w-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                          {step.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.section>
  );
}
