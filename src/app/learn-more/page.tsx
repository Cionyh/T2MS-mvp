"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import posthog from "@/lib/posthog";
import Link from "next/link";
import { 
  Zap, 
  Globe, 
  Shield, 
  Smartphone, 
  MessageSquare, 
  Rocket, 
  Check, 
  Clock, 
  Users, 
  Settings,
  ArrowRight,
  Star,
  Download
} from "lucide-react";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Instant Updates",
    description: "Send a text, and your website updates in seconds — no logins required.",
    icon: Zap,
    color: "from-pink-500 to-red-500",
  },
  {
    title: "Multiple Platforms",
    description: "Works with WordPress, Wix, Shopify, Squarespace, BigCommerce, Ghost, GoDaddy, and more.",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Secure & Verified",
    description: "Only pre-approved numbers can send updates, all connections are encrypted.",
    icon: Shield,
    color: "from-emerald-500 to-lime-500",
  },
  {
    title: "Simple & Smart",
    description: "No technical skills needed — just text your updates and relax.",
    icon: Smartphone,
    color: "from-purple-500 to-pink-500",
  },
];

const steps = [
  {
    title: "Send a Text",
    description: "Send a message from your registered phone number.",
    icon: Rocket,
    color: "from-pink-500 to-red-500",
  },
  {
    title: "Text2MySite™ Delivers It",
    description: "We link your text to your connected site automatically.",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Display Instantly",
    description: "Your message shows live on your site as a banner, popup, or fullscreen.",
    icon: Globe,
    color: "from-emerald-500 to-lime-500",
  },
];

const benefits = [
  {
    title: "No Dashboard Required",
    description: "Update your website without logging into any admin panel or dashboard.",
    icon: Settings,
  },
  {
    title: "Real-Time Updates",
    description: "Your changes appear instantly on your live website for all visitors to see.",
    icon: Clock,
  },
  {
    title: "Perfect for Small Business",
    description: "Ideal for restaurants, retail stores, service providers, and local businesses.",
    icon: Users,
  },
];

const useCases = [
  "Announce holiday hours or special closures",
  "Post daily specials or promotions",
  "Update your current status (Open/Closed)",
  "Share emergency announcements",
  "Display real-time inventory updates",
  "Communicate with customers instantly"
];

export default function LearnMorePage() {
  const handleCTA = () => {
    posthog.capture("learn_more_cta_click");
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <DotPattern
        className={cn(
          "-z-50",
          "[mask-image:radial-gradient(10000px_circle_at_center,white,transparent)]"
        )}
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Card className="rounded-[3em] bg-gradient-to-b from-background via-background to-muted border-none backdrop-blur-md py-20">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-serif">
                Learn More About Text2MySite™
              </CardTitle>
              <CardDescription className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                Text2MySite™ is a breakthrough platform that allows small business owners to update their live websites just by sending a simple text message. Whether it's posting holiday hours, announcing special offers, or adjusting your status for the day, Text2MySite™ makes it effortless.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    onClick={handleCTA}
                    className="bg-primary text-foreground hover:bg-primary/90 px-8 py-4 text-lg"
                  >
                    Register Your Site
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a 
                  href="/quick_start_manual.pdf" 
                  download="Text2MySite-Quick-Start-Manual.pdf"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-lg hover:bg-primary/5"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium">Download Quick Start Guide</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="rounded-[3em] bg-gradient-to-b from-background via-background to-muted border-none backdrop-blur-md py-20">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-serif">
                How It Works
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-3xl mx-auto">
                You register your website with Text2MySite™. We verify your cell phone number and assign you a unique account number. You select specific sections of your website for banners, tickers, pop-ups or full page — to receive text-based updates.
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
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-serif mb-4">
              Why Choose Text2MySite™?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for small business owners who need quick, reliable website updates.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="flex flex-col items-center text-center p-6 h-full bg-muted/40 hover:bg-muted/60 transition-colors duration-300 rounded-3xl">
                    <div
                      className={cn(
                        "w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg mb-4",
                        feature.color
                      )}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
  <CardHeader className="flex flex-col items-center">
    <h3 className="text-xl font-bold text-center">{feature.title}</h3>
  </CardHeader>
  <CardContent>
    <CardDescription className="text-center">{feature.description}</CardDescription>
  </CardContent>
</Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="rounded-[3em] bg-gradient-to-b from-background via-background to-muted border-none backdrop-blur-md py-20">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-serif">
                Key Benefits
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Experience the convenience of updating your website without the hassle of traditional methods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-3">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <Card key={benefit.title} className="bg-muted/40 hover:bg-muted/60 transition-colors duration-300 rounded-3xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                          <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Use Cases Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-serif mb-4">
              Perfect For
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Here are just some of the ways small businesses use Text2MySite™ to stay connected with their customers.
            </p>
          </div>

          <Card className="rounded-[3em] bg-gradient-to-b from-background via-background to-muted border-none backdrop-blur-md py-20">
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-muted/40 rounded-2xl">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{useCase}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="rounded-[3em] bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 border-primary/20 backdrop-blur-md py-20">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl font-serif">
                Ready to Update Your Website Instantly?
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of small business owners who are already using Text2MySite™ to stay connected with their customers. Start with our free plan today.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-8 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/sign-in">
          <Button
            size="lg"
            onClick={handleCTA}
                    className="bg-primary text-foreground hover:bg-primary/90 px-8 py-4 text-lg"
          >
            Register Your Site
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg border-2 border-primary"
                  >
                    View All Plans
          </Button>
        </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>14-day free trial on all paid plans</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
