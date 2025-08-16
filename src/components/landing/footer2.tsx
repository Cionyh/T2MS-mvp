"use client";
/* eslint-disable */

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { TermsOfUseDialog } from "./terms";
import { PrivacyPolicyDialog } from "./privacy";
import Link from "next/link";

export function Footer({ footerRef }: { footerRef?: any }) {
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <footer ref={footerRef} id="footer" className="w-full bg-muted/20 border-t border-muted mt-12 rounded-t-[3em]">
      <Card className="bg-transparent border-none rounded-none py-10 px-6 sm:px-12">
        <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 sm:gap-0 text-center sm:text-left">
          {/* Branding / Site Title */}
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-2xl ">Text<span className="text-primary">2</span>MySite</h3>
            <p className="text-sm text-muted-foreground mt-1">
              A project by Morning Noon Night, LLC
            </p>
          </div>

         {/* Legal Links */}
<div className="flex-1 flex flex-col justify-center gap-4">
  <button
    className="text-sm text-muted-foreground hover:text-primary transition-colors"
    onClick={() => setTermsOpen(true)}
  >
    Terms of Use
  </button>
  <button
    className="text-sm text-muted-foreground hover:text-primary transition-colors"
    onClick={() => setPrivacyOpen(true)}
  >
    Privacy Policy
  </button>
</div>


          {/* Contact Info */}
          <div className="flex-1 flex flex-col items-center sm:items-end">
            <p className="text-sm text-muted-foreground">
              CONTACT US
            </p>
            <a
              href="mailto:info@t2ms.biz"
              className="text-sm text-primary hover:underline mt-1"
            >
              info@t2ms.biz
            </a>
          </div>
        </CardContent>

        {/* Copyright */}
        <div className="w-full border-t border-muted mt-8 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Text2MySite. All rights reserved.
          </p>
        </div>

        {/* Dialogs */}
        <TermsOfUseDialog open={termsOpen} onOpenChange={setTermsOpen} />
        <PrivacyPolicyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      </Card>
    </footer>
  );
}
