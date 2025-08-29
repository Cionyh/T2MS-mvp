"use client";
/* eslint-disable */

import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { LineShadowText } from "../magicui/line-shadow-text";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How quickly will my update appear on my site?",
    answer:
      "Within seconds — updates are instant once you send your text",
  },
  {
     question: "Do I need to log in?",
     answer: "No — updates are made by text only, no dashboard required."
  },
  {
    question: "Do I need to log in to make changes?",
    answer:
      "No. Once your number is verified, you can simply send a text message to update your site without logging in.",
  },
  {
    question: "Is it secure?",
    answer:
      "Absolutely. Only pre-approved phone numbers can send updates.",
  },
  {
    question: "How to contact us?",
    answer:
      "Send an email to  support@t2ms.biz and we will respond within 24 hours.",
  },
  {
    question: "What platforms does it work with?",
    answer:
      "It works with any website that allows you to embed HTML/JavaScript code snippets.",  
  },

  {
    question: "Can I customize the appearance of the updates?",
    answer:
      "Yes, you can customize the look and feel of the widget.",
  },
  {
    question: "How do I remove the widget?",
    answer:
      "You can easily pin or unpin the widget from your site dashboard.",
  },
];

export function FAQSection() {
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  return (
    <section id="faqs" className="w-full max-w-4xl mx-auto px-4 md:px-8 py-30">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="font-extrabold bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent tracking-tight text-3xl sm:text-4xl md:text-5xl font-serif">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-muted-foreground mt-4">
          Everything you need to know before you start using our service.
        </p>
      </div>

      {/* Security Blurb */}
      <div className="my-10 rounded-3xl border border-muted-foreground/20 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-5xl">🔒</span> Secure by Design
        </h3>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Only <span className="font-medium">verified senders</span> can post
          updates. We use <span className="font-medium">rate-limiting</span> to
          block spam and <span className="font-medium">tenant-level routing</span> 
          to make sure every message lands safely on the right site — so random
          people can’t post.
        </p>
      </div>

      {/* FAQ List */}
      <div className="divide-y divide-muted-foreground/20">
        {faqs.map((faq) => {
          const [isOpen, setIsOpen] = React.useState(false);

          return (
            <Collapsible
              key={faq.question}
              open={isOpen}
              onOpenChange={setIsOpen}
              className="py-3"
            >
              <CollapsibleTrigger asChild>
                <button className="flex w-full items-center justify-between text-left font-medium text-lg hover:text-primary transition-colors">
                  <span>{faq.question}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="ml-2 shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground mt-2"
                >
                  {faq.answer}
                </motion.p>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </section>
  );
}
