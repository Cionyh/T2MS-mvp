// app/privacy-policy/page.tsx
"use client";
/* eslint-disable */

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 sm:px-8 lg:px-10">
      <header className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-extrabold">PRIVACY POLICY</h1>
        
      </header>

      <ScrollArea className="h-[70vh] lg:h-[75vh] overflow-y-auto pr-2">
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-foreground">
          <p>
            <strong>Text2MySite™ (Text2MySite™)</strong>, a service provided by Morning
            Noon Night, LLC, is committed to protecting your privacy and
            complying with industry best practices for SMS-based communication.
          </p>

          <h3 className="font-semibold">1. Information We Collect</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Business name and contact info</li>
            <li>SMS phone numbers</li>
            <li>Message content sent to the platform</li>
            <li>Website platform and zone preferences</li>
            <li>Technical metadata (timestamps, IPs, delivery status)</li>
          </ul>

          <h3 className="font-semibold">2. Use of Information</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Deliver and display messages to your website</li>
            <li>Provide support and communication</li>
            <li>Improve our service quality and reliability</li>
            <li>Prevent misuse or abuse of our system</li>
          </ul>

          <h3 className="font-semibold">3. SMS and Consent</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Obtain user consent before sending messages</li>
            <li>
              Do not submit messages containing personal health, financial, or
              sensitive data
            </li>
            <li>
              All SMS submissions are processed through Twilio, our third-party
              service provider, and subject to their privacy and security
              practices.
            </li>
          </ul>

          <h3 className="font-semibold">4. Data Sharing</h3>
          <p>
            We do not sell or share your personal data with third parties for
            marketing. We only share data with:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Twilio (SMS delivery)</li>
            <li>Google Cloud or Siteground (infrastructure providers)</li>
            <li>Developers or contractors with signed NDAs</li>
          </ul>

          <h3 className="font-semibold">5. Security</h3>
          <p>
            We use SSL encryption, firewalls, and restricted database access to
            protect your data. Your data is encrypted in transit and at rest.
          </p>

          <h3 className="font-semibold">6. Retention</h3>
          <p>
            We retain SMS records for up to 12 months for operational, legal, and
            audit purposes. You may request deletion of your records by contacting
            us.
          </p>

          <h3 className="font-semibold">7. Opt-Out</h3>
          <p>
            If you no longer wish to use Text2MySite™, email us to deactivate your
            account and delete stored information. You may also stop SMS messages
            by replying STOP.
          </p>

          <h3 className="font-semibold">8. Children’s Privacy</h3>
          <p>
            Text2MySite™ is not intended for children under 13 and does not
            knowingly collect data from minors.
          </p>

          <h3 className="font-semibold">9. Your Rights</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Access to your stored information</li>
            <li>Correction of inaccurate data</li>
            <li>
              Deletion or export of your records (subject to legal compliance)
            </li>
          </ul>

          <h3 className="font-semibold">10. Contact Us</h3>
          <p>
            Questions? Contact:{" "}
            <a
              href="mailto:support@t2ms.biz"
              className="text-primary underline hover:text-primary/80 transition-colors"
            >
              support@t2ms.biz
            </a>
            <br />
            Morning Noon Night, LLC - 8704 South Sepulveda Blvd, #1052 -
            Westchester, CA 90045
          </p>
        </div>
      </ScrollArea>

      <div className="mt-6 flex justify-end">
        <Link href="/">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Close
          </Button>
        </Link>
      </div>
    </div>
  );
}
