import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion'; // Import Variants

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define your animation variants using Variants type
const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      delay: 0.2,
    },
  },
};

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});


const Footer = () => {
  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (values: any) => {
    //  handle contact form submission here (e.g., sending email)
    console.log("Form values:", values);
    alert("Form Submitted Successfully!");
  };

  return (
    <motion.div className="w-full py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="w-full" variants={textVariants}>
          <Card className="rounded-3xl shadow-lg border-none">
            <CardHeader className="flex flex-col items-center gap-4 text-center py-8">
              <CardTitle className="text-2xl font-semibold">
                Ready to Supercharge Your Site?
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl text-muted-foreground">
                Unlock the power of AI-driven content creation.  Contact us
                to learn how Text2MySite can transform your website.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us about your project" {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Send Message</Button>
                  </form>
                </Form>
              </div>

              {/* Company Info / Quick Links */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="hover:text-primary transition-colors duration-200">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-primary transition-colors duration-200">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/features" className="hover:text-primary transition-colors duration-200">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-primary transition-colors duration-200">
                      Pricing
                    </Link>
                  </li>
                </ul>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold">Contact Information</h3>
                  <p className="text-muted-foreground">
                    123 Main Street, Anytown, CA 12345
                  </p>
                  <p className="text-muted-foreground">
                    Email: info@text2mysite.com
                  </p>
                  <p className="text-muted-foreground">
                    Phone: (123) 456-7890
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-center py-6">
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={buttonVariants}
              >
                <Button asChild size="lg" className="text-foreground">
                  <Link href="/sign-in">Register Your Site</Link>
                </Button>
              </motion.div>
            </CardFooter>

            <div className="text-center py-4 text-muted-foreground">
              © {new Date().getFullYear()} Text2MySite. All rights reserved.
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Footer;