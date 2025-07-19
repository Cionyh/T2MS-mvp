"use client";
/* eslint-disable */


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export function Footer({
  footerRef,
  textVariants,
  buttonVariants,
}: Readonly<{ footerRef: any; textVariants: any; buttonVariants: any }>) {
  return (
    <motion.div
      ref={footerRef}
      className="w-full max-w-10xl mt-10 mx-auto px-4 sm:px-6 lg:px-8"
      variants={textVariants}
    >
      <Card className="rounded-[3em] bg-gradient-to-br from-muted/50 to-muted/40 border-2 border-primary">
        <CardContent className="flex flex-col items-center justify-center gap-8 py-14 px-4 sm:px-10 text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Ready to simplify your website updates?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              With <span className="font-semibold text-primary">Text2MySite</span>, you can update your site by just sending an SMS. No logins. No dashboards. Just simplicity.
            </p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            variants={buttonVariants}
            whileHover={{ scale: 1.02 }}
          >
            <Button
              asChild
              size="lg"
              className="text-foreground bg-primary hover:bg-primary/90 transition-all"
            >
              <Link href="/sign-in">Register Your Site</Link>
            </Button>
          </motion.div>

          <div className="w-full border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Text2MySite. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
