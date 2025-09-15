"use client";

import { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DocsSidebar } from "./docs-sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";

const platforms = [
  { name: "WordPress", href: "/docs/wordpress", description: "Plugin or custom code integration" },
  { name: "Wix", href: "/docs/wix", description: "HTML widget integration" },
  { name: "Webflow", href: "/docs/webflow", description: "Embed code integration" },
  { name: "Shopify", href: "/docs/shopify", description: "Theme code or app block" },
  { name: "Squarespace", href: "/docs/squarespace", description: "Custom code block" },
  { name: "BigCommerce", href: "/docs/bigcommerce", description: "Custom code integration" },
  { name: "Duda", href: "/docs/duda", description: "Custom HTML integration" },
  { name: "Ghost", href: "/docs/ghost", description: "Custom code integration" },
  { name: "GoDaddy", href: "/docs/godaddy", description: "Website builder integration" },
  { name: "HTML/HTML5", href: "/docs/html", description: "Universal HTML integration" },
  { name: "Joomla", href: "/docs/joomla", description: "Custom module integration" },
  { name: "Weebly", href: "/docs/weebly", description: "Custom HTML integration" },
];

export function DocsHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredPlatforms, setFilteredPlatforms] = useState(platforms);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlatforms(platforms);
    } else {
      const filtered = platforms.filter(platform =>
        platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        platform.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlatforms(filtered);
    }
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-6 pb-0">
              <SheetTitle>Documentation</SheetTitle>
            </SheetHeader>
            <div className="px-6">
              <DocsSidebar />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isSearchOpen}
              className="w-full justify-start text-muted-foreground"
            >
              <Search className="mr-2 h-4 w-4" />
              Search platforms...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <div className="p-3">
              <Input
                placeholder="Search platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-3"
              />
              <div className="max-h-[300px] overflow-y-auto">
                {filteredPlatforms.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No platforms found.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredPlatforms.map((platform) => (
                      <Link
                        key={platform.href}
                        href={platform.href}
                        className="block p-3 rounded-md hover:bg-muted transition-colors"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {platform.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

    </div>
  );
}
