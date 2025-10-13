"use client";

import { PricingSection } from "@/components/landing/pricing";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <DotPattern
        className={cn(
          "absolute inset-0 -z-50",
          "[mask-image:radial-gradient(10000px_circle_at_center,white,transparent)]"
        )}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your Text2MySite™ needs. 
            Start free and scale as you grow.
          </p>
        </div>
        
        <PricingSection />
        
        
      </div>
    </div>
  );
}
