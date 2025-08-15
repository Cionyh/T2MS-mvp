"use client";
/* eslint-disable */

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface TermsOfUseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsOfUseDialog: React.FC<TermsOfUseDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full rounded-3xl p-6 sm:p-8 lg:p-10">
        <DialogHeader className="flex justify-between items-start mb-2">
          <DialogTitle className="text-base font-extrabold">
            TERMS OF USE
          </DialogTitle>
          <DialogClose className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-6 w-6" />
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="h-[60vh] sm:h-[70vh] lg:h-[75vh] overflow-y-auto pr-2">
          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-foreground">
            <p>
              <strong>T2MS (Text2MySite)</strong>, a service owned and operated
              by Morning Noon Night, LLC. By accessing or using our service,
              you agree to be bound by the following Terms of Use:
            </p>

            <h3 className="font-semibold">1. Overview</h3>
            <p>
              T2MS allows users to send SMS messages to update designated
              sections of their business website. The service is intended for
              lawful, professional use only.
            </p>

            <h3 className="font-semibold">2. Eligibility</h3>
            <p>
              You must be at least 18 years old and the authorized
              representative of a business or organization to use this service.
            </p>

            <h3 className="font-semibold">3. Consent and Compliance</h3>
            <p>By using T2MS, you confirm that:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                You have obtained proper consent from all phone numbers sending
                messages to the platform.
              </li>
              <li>You will not use the service for unsolicited marketing or spamming.</li>
              <li>
                Your use complies with all applicable laws, including but not
                limited to the TCPA and CTIA Messaging Principles.
              </li>
            </ul>

            <h3 className="font-semibold">4. Message Handling</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                T2MS integrates with third-party SMS providers (e.g., Twilio) and
                does not guarantee message delivery.
              </li>
              <li>
                Message delays, failures, or delivery inconsistencies may occur
                and are not the liability of T2MS.
              </li>
            </ul>

            <h3 className="font-semibold">5. Prohibited Uses</h3>
            <p>You agree not to use the platform to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Send abusive, fraudulent, or unlawful content.</li>
              <li>Attempt unauthorized access to servers or other systems.</li>
              <li>
                Violate Twilio's Acceptable Use Policy or any other third-party
                provider policies.
              </li>
            </ul>

            <h3 className="font-semibold">6. Service Limitations</h3>
            <p>
              T2MS is not responsible for loss or damage due to message
              misrouting, user error, or platform outages. Message history and
              logs are retained for security and audit purposes.
            </p>

            <h3 className="font-semibold">7. Account Security</h3>
            <p>
              You are responsible for safeguarding your account credentials and
              SMS key. Notify us immediately of any unauthorized use.
            </p>

            <h3 className="font-semibold">8. Termination</h3>
            <p>
              We may suspend or terminate your access for any violation of these
              Terms without prior notice.
            </p>

            <h3 className="font-semibold">9. Modifications</h3>
            <p>
              T2MS reserves the right to change these Terms at any time. Continued
              use of the service constitutes acceptance of any changes.
            </p>

            <h3 className="font-semibold">10. Contact</h3>
            <p>
              For support or questions, email us at:{" "}
              <a
                href="mailto:support@t2ms.com"
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                support@t2ms.com
              </a>
            </p>
          </div>
        </ScrollArea>

        <div className="mt-6 flex justify-end">
          <DialogClose asChild>
            <Button className="bg-primary text-white hover:bg-primary/90">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
