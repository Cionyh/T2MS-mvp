"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";


const platforms = [
  {
    name: "WordPress",
    description: "Integrate with any WordPress site using our plugin or custom code",
    difficulty: "Easy",
    href: "/docs/wordpress",
    logo: "/images/wp.svg"
  },
  {
    name: "Wix",
    description: "Add Text2MySite™ to your Wix site with our custom HTML widget",
    difficulty: "Easy",
    href: "/docs/wix",
    logo: "/images/wix.svg"
  },
  {
    name: "Webflow",
    description: "Seamlessly integrate with Webflow using our embed code",
    difficulty: "Easy",
    href: "/docs/webflow",
    logo: "/images/webflow.svg"
  },
  {
    name: "Shopify",
    description: "Add Text2MySite™ to your Shopify store for instant updates",
    difficulty: "Easy",
    href: "/docs/shopify",
    logo: "/images/shopify.svg"
  },
  {
    name: "Squarespace",
    description: "Integrate with Squarespace using our custom code block",
    difficulty: "Easy",
    href: "/docs/squarespace",
    logo: "/images/ss.svg"
  },
  {
    name: "BigCommerce",
    description: "Integrate with BigCommerce stores using our custom code",
    difficulty: "Easy",
    href: "/docs/bigcommerce",
    logo: "/images/bigcommerce.png"
  },
  {
    name: "Duda",
    description: "Add Text2MySite™ to your Duda website with custom HTML",
    difficulty: "Easy",
    href: "/docs/duda",
    logo: "/images/duda.png"
  },
  {
    name: "Ghost",
    description: "Integrate with Ghost CMS using our custom code",
    difficulty: "Easy",
    href: "/docs/ghost",
    logo: "/images/ghost.png"
  },
  {
    name: "GoDaddy",
    description: "Add Text2MySite™ to your GoDaddy website builder",
    difficulty: "Easy",
    href: "/docs/godaddy",
    logo: "/images/gd.svg"
  },
  {
    name: "HTML/HTML5",
    description: "Add to any website with custom HTML, React, Vue, or Angular",
    difficulty: "Easy",
    href: "/docs/html",
    logo: "/images/html5.png"
  },
  {
    name: "Joomla",
    description: "Integrate with Joomla CMS using our custom module",
    difficulty: "Medium",
    href: "/docs/joomla",
    logo: "/images/joomla.svg"
  },
  {
    name: "Weebly",
    description: "Add Text2MySite™ to your Weebly site with custom HTML",
    difficulty: "Easy",
    href: "/docs/weebly",
    logo: "/images/weebly.svg"
  }
];


export default function DocsPage() {
  return (
    <div className="space-y-12">



      {/* Platform Integrations */}
      <motion.section
        id="platforms"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center mt-6">
          <h2 className="text-3xl font-bold mb-4">Platform Integrations</h2>
          <p className="text-muted-foreground">
            Choose your platform to see detailed integration instructions
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-muted/50">
                      <Image
                        src={platform.logo}
                        alt={`${platform.name} logo`}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <Badge variant="secondary">{platform.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-xl">{platform.name}</CardTitle>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-end">
                    <Button asChild size="sm" variant="outline" className="text-xs text-primary">
                      <Link href={platform.href}>
                        View Guide
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

    </div>
  );
}
