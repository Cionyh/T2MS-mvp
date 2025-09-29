"use client";
/* eslint-disable */

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function Footer({ footerRef }: { footerRef?: any }) {
  return (
    <footer
      ref={footerRef}
      id="footer"
      className="w-full bg-muted/20 border-t border-muted mt-12 rounded-t-[3em]"
    >
      <Card className="bg-transparent border-none rounded-none py-10 px-6 sm:px-12">
        <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 sm:gap-0 text-center sm:text-left">
          {/* Branding / Site Title */}
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-2xl">
              Text<span className="text-primary">2</span>MySite
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              A project of Morning Noon Night, Ent.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex-1 flex flex-col justify-center gap-4">
            <Link
              href="/legal/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/legal/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal/sms-terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              SMS Terms & Conditions
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex-1 flex flex-col items-center sm:items-end">
            <p className="text-sm text-muted-foreground">CONTACT US</p>
            <a
              href="mailto:support@t2ms.biz"
              className="text-sm text-primary hover:underline mt-1"
            >
              support@t2ms.biz
            </a>
          </div>
        </CardContent>

        {/* System Status */}
        <div className="w-full flex justify-center sm:justify-end mt-6">
          <Link
            href="/status"
            className="text-xs text-green-600 hover:text-green-500 font-medium"
          >
            ● All systems operational
          </Link>
        </div>

        {/* Copyright */}
        <div className="w-full border-t border-muted mt-4 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Text2MySite™. All rights reserved.
          </p>
        </div>

      </Card>
    </footer>
  );
}
