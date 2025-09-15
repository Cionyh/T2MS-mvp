"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronDown, 
  ChevronRight, 
  Globe,
  ExternalLink,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Platform Integrations",
    icon: Globe,
    items: [
      { title: "WordPress", href: "/docs/wordpress" },
      { title: "Wix", href: "/docs/wix" },
      { title: "Webflow", href: "/docs/webflow" },
      { title: "Shopify", href: "/docs/shopify" },
      { title: "Squarespace", href: "/docs/squarespace" },
      { title: "BigCommerce", href: "/docs/bigcommerce" },
      { title: "Duda", href: "/docs/duda" },
      { title: "Ghost", href: "/docs/ghost" },
      { title: "GoDaddy", href: "/docs/godaddy" },
      { title: "HTML/HTML5", href: "/docs/html" },
      { title: "Joomla", href: "/docs/joomla" },
      { title: "Weebly", href: "/docs/weebly" },
    ]
  }
];

interface NavItemProps {
  title: string;
  href: string;
  isActive: boolean;
  external?: boolean;
}

function NavItem({ title, href, isActive, external = false }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {title}
      {external && <ExternalLink className="h-3 w-3" />}
    </Link>
  );
}

interface NavSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Array<{ title: string; href: string; external?: boolean }>;
  isExpanded: boolean;
  onToggle: () => void;
}

function NavSection({ title, icon: Icon, items, isExpanded, onToggle }: NavSectionProps) {
  const pathname = usePathname();
  
  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 rounded-md transition-colors"
      >
        <Icon className="h-4 w-4" />
        {title}
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronRight className="h-4 w-4 ml-auto" />
        )}
      </button>
      
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="pl-6 space-y-1">
          {items.map((item) => (
            <NavItem
              key={item.href}
              title={item.title}
              href={item.href}
              isActive={pathname === item.href}
              external={item.external}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function DocsSidebar() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Platform Integrations"])
  );

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Platform Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Choose your platform for integration instructions
        </p>
      </div>

      <nav className="space-y-4">
        {navigation.map((section) => (
          <NavSection
            key={section.title}
            title={section.title}
            icon={section.icon}
            items={section.items}
            isExpanded={expandedSections.has(section.title)}
            onToggle={() => toggleSection(section.title)}
          />
        ))}
      </nav>

      <div className="pt-6 border-t border-border">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Quick Links</h3>
          <div className="space-y-1">
            <Link
              href="/sign-in"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Zap className="h-4 w-4" />
              Get Started
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  );
}
