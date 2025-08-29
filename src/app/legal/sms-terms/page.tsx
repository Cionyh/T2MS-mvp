// app/sms-terms/page.tsx
"use client";
/* eslint-disable */

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SMSTermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 sm:px-8 lg:px-10">
      <header className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-extrabold">SMS TERMS & CONDITIONS</h1>

      </header>

      <ScrollArea className="h-[70vh] lg:h-[75vh] overflow-y-auto pr-2">
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-foreground">
          <p>
            By opting into SMS messages from <strong>Text2MySite</strong>, a
            service operated by Morning Noon Night, LLC, you agree to receive
            recurring text messages regarding service updates, account
            notifications, and other relevant communications.
          </p>

          <h3 className="font-semibold">1. Consent to Receive Messages</h3>
          <p>
            By providing your mobile number, you consent to receive SMS
            communications from Text2MySite. Message frequency will vary based
            on your usage of the service. Consent is not a condition of purchase.
          </p>

          <h3 className="font-semibold">2. Message & Data Rates</h3>
          <p>
            Standard messaging and data rates may apply depending on your mobile
            carrier plan. Check with your carrier for details.
          </p>

          <h3 className="font-semibold">3. Opt-Out Instructions</h3>
          <p>
            You can cancel SMS communications at any time by replying{" "}
            <strong>STOP</strong> to any message. After doing so, you will
            receive a confirmation message, and you will no longer receive SMS
            updates. To rejoin, opt in again through your account.
          </p>

          <h3 className="font-semibold">4. Help Instructions</h3>
          <p>
            For assistance, reply <strong>HELP</strong> to any message or email{" "}
            <a
              href="mailto:support@t2ms.biz"
              className="text-primary underline hover:text-primary/80 transition-colors"
            >
              support@t2ms.biz
            </a>
            .
          </p>

          <h3 className="font-semibold">5. Supported Carriers</h3>
          <p>
            Text2MySite SMS messages are delivered via major U.S. carriers.
            However, delivery is not guaranteed and may be affected by carrier
            limitations, network issues, or technical disruptions.
          </p>

          <h3 className="font-semibold">6. Privacy</h3>
          <p>
            Your phone number and message content are handled in accordance with
            our{" "}
            <Link
              href="/privacy-policy"
              className="text-primary underline hover:text-primary/80 transition-colors"
            >
              Privacy Policy
            </Link>
            . Data may be shared with third-party providers (e.g., Twilio) to
            facilitate SMS delivery.
          </p>

          <h3 className="font-semibold">7. Liability</h3>
          <p>
            Text2MySite is not liable for delayed, undelivered, or misrouted
            messages. Message delivery depends on carrier networks and may be
            subject to interruptions.
          </p>

          <h3 className="font-semibold">8. Contact</h3>
          <p>
            For questions regarding SMS Terms & Conditions, contact:{" "}
            <a
              href="mailto:support@t2ms.biz"
              className="text-primary underline hover:text-primary/80 transition-colors"
            >
              support@t2ms.biz
            </a>
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
