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
            <button
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setPrivacyOpen(true)}
            >
              SMS Terms & Conditions
            </button>
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
            © {new Date().getFullYear()} Text2MySite. All rights reserved.
          </p>
        </div>

        {/* Additional Legal Disclosures */}
        <div className="mt-6 px-4 space-y-6 text-xs text-muted-foreground">
          {/* Opt-In Consent for SMS */}
          <details className="group">
            <summary className="cursor-pointer list-none select-none hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
              <strong>Opt-In (End-User Consent for SMS)</strong>
            </summary>
            <div className="mt-2 leading-relaxed pl-2 border-l-2 border-primary/30">
              By providing your mobile number and using Text2MySite (T2MS),
              you consent to receive text messages related to website updates,
              account activity, and service notifications. Message frequency
              varies based on use. Standard message and data rates may apply.
              Consent is not a condition of purchase. You may opt out of
              receiving messages at any time by replying STOP. For help, reply
              HELP.
            </div>
          </details>

          {/* Client Cancellation Policy */}
          <details className="group">
            <summary className="cursor-pointer list-none select-none hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
              <strong>Opt-Out / Client Cancellation (Business Customers of T2MS)</strong>
            </summary>
            <div className="mt-2 leading-relaxed pl-2 border-l-2 border-primary/30">
              Clients may cancel their T2MS account at any time by providing written
              notice to{" "}
              <a
                href="mailto:support@t2ms.biz"
                className="text-primary hover:underline"
              >
                support@t2ms.biz
              </a>
              . Account cancellation requests must be received at least 10 business
              days prior to the next billing cycle to avoid additional charges.
              <br />
              <br />
              In the event of non-payment, T2MS reserves the right to suspend or
              terminate services immediately. Clients remain responsible for any
              unpaid balances accrued prior to cancellation or suspension.
              <br />
              <br />
              Once an account is cancelled, associated numbers, keywords, and content
              may be permanently deleted and cannot be recovered.
            </div>
          </details>
        </div>
      </Card>

      {/* Dialogs */}
      <TermsOfUseDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyPolicyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </footer>
  );
}
