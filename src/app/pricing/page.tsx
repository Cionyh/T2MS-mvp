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
        
        {/* Additional pricing information */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-muted/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
                  <p className="text-muted-foreground text-sm">
                    Yes! You can upgrade or downgrade your plan at any time. 
                    Changes take effect immediately.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What happens if I exceed my limits?</h4>
                  <p className="text-muted-foreground text-sm">
                    We'll notify you when you're approaching your limits. 
                    You can upgrade your plan or wait for the next billing cycle.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                  <p className="text-muted-foreground text-sm">
                    Yes! All paid plans come with a 14-day free trial. 
                    No credit card required to start.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Need Help Choosing?</h3>
              <p className="text-muted-foreground mb-6">
                Not sure which plan is right for you? Our team is here to help 
                you find the perfect solution for your needs.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Free consultation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Custom recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Migration assistance</span>
                </div>
              </div>
              <button className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
