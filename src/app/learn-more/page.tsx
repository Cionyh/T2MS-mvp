"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import posthog from "@/lib/posthog";
import Link from "next/link";
import { Zap, Globe, Shield, Smartphone } from "lucide-react";

const features = [
  {
    title: "Instant Updates",
    description: "Send a text, and your website updates in seconds — no logins required.",
    icon: <Zap className="h-12 w-12 text-primary mb-4" />,
  },
  {
    title: "Multiple Platforms",
    description: "Works with WordPress, Wix, Shopify, Squarespace, and more.",
    icon: <Globe className="h-12 w-12 text-primary mb-4" />,
  },
  {
    title: "Secure & Verified",
    description: "Only pre-approved numbers can send updates, all connections are encrypted.",
    icon: <Shield className="h-12 w-12 text-primary mb-4" />,
  },
  {
    title: "Simple & Smart",
    description: "No technical skills needed — just text your updates and relax.",
    icon: <Smartphone className="h-12 w-12 text-primary mb-4" />,
  },
];

export default function LearnMorePage() {
  const handleCTA = () => {
    posthog.capture("learn_more_cta_click");
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-serif bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent mb-4"
        >
          How Text2MySite Works
        </motion.h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Easily update your website’s key sections by simply sending a text message. Fast, secure, and hassle-free.
        </p>
        <Link href="/sign-in">
          <Button
            size="lg"
            onClick={handleCTA}
            className="bg-primary text-foreground hover:bg-primary/90 px-6 py-4"
          >
            Register Your Site
          </Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
         <Card key={feature.title} className="flex flex-col items-center text-center p-6">
  {feature.icon}
  <CardHeader className="flex flex-col items-center">
    <h3 className="text-xl font-bold text-center">{feature.title}</h3>
  </CardHeader>

  <CardContent>
    <CardDescription className="text-center">{feature.description}</CardDescription>
  </CardContent>
</Card>

        ))}
      </section>

      {/* CTA Banner */}
      <section className="w-full bg-primary/5 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to update your website instantly?</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
          Sign up today and start sending text updates that appear live on your site in seconds.
        </p>
        <Link href="/sign-in">
          <Button
            size="lg"
            onClick={handleCTA}
            className="bg-primary text-foreground hover:bg-primary/90 px-6 py-4"
          >
            Register Your Site
          </Button>
        </Link>
      </section>
    </div>
  );
}
