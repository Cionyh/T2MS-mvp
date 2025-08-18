"use client";
/* eslint-disable */

import { useState, useMemo, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Plus } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion"; // Import AnimatePresence and motion
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading states
import { DotPattern } from "../magicui/dot-pattern";
import { cn } from "@/lib/utils";

// Validation schema for client information
const clientSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Business Name must be at least 2 characters." }),
  domain: z
    .string()
    .url({ message: "Invalid URL format. Please include https:// or http://." }),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, {
    message: "Phone must be in E.164 format (e.g. +14155552671)",
  }),
});

// Validation schema for widget configuration
const widgetSchema = z.object({
  type: z.enum(["banner", "popup", "fullscreen"]),
  bgColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: "Invalid hex color code." }),
  textColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: "Invalid hex color code." }),
  font: z.string().min(1, { message: "Font is required." }),
});

type ClientSchemaType = z.infer<typeof clientSchema>;
type WidgetSchemaType = z.infer<typeof widgetSchema>;

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

export default function ClientWidgetBuilder() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [clientCreated, setClientCreated] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  // Form for client information
  const clientForm = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      domain: "",
      phone: "",
    },
  });

  // Form for widget configuration
  const widgetForm = useForm<WidgetSchemaType>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      type: "banner",
      bgColor: "#222",
      textColor: "#fff",
      font: "sans-serif",
    },
  });

  const { watch } = widgetForm;
  const type = watch("type");
  const bgColor = watch("bgColor");
  const textColor = watch("textColor");
  const font = watch("font");

  const embedCode = useMemo(() => {
    if (!clientId) return "";
    return `<script 
  src="https://www.t2ms.biz/widget"
  data-client-id="${clientId}"
  data-type="${type}"
  data-bg="${bgColor}"
  data-color="${textColor}"
  data-font="${font}"
  data-api="https://www.t2ms.biz"
  defer
></script>`;
  }, [clientId, type, bgColor, textColor, font]);

  const handleCreateClient = async (values: ClientSchemaType) => {
    if (!userId) {
      toast.error("You must be logged in to register a client.");
      return;
    }

    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, userId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create client");

      setClientCreated(true);
      setClientId(data.id);
      toast.success("Client created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleCopy = async () => {
    if (!embedCode) return;
    await navigator.clipboard.writeText(embedCode);
    toast.success("Embed script copied!");
  };

  return (
    <div className="container mx-auto py-2">
       <DotPattern
        className={cn(
          "-z-50", 
          "[mask-image:radial-gradient(10000px_circle_at_center,white,transparent)]"
        )}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Forms */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="w-5 h-5" /> Register Your Site
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...clientForm}>
                <form
                  onSubmit={clientForm.handleSubmit(handleCreateClient)}
                  className="space-y-4"
                >
                  <FormField
                    control={clientForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="name">Business Name</Label>
                        <FormControl>
                          <Input
                            id="name"
                            placeholder="Your Business Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="domain">Domain (e.g. example.com)</Label>
                        <FormControl>
                          <Input id="domain" placeholder="example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="phone">Phone</Label>
                        <FormControl>
                          <Input id="phone" placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={clientForm.formState.isSubmitting}
                    className="text-foreground"
                  >
                    Register Site
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <AnimatePresence>
            {clientCreated && clientId && (
              <motion.div
                key="widget-config"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Configure Your Widget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...widgetForm}>
                      <form className="space-y-4">
                        <FormField
                          control={widgetForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="type">Widget Type</Label>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="banner">Banner</SelectItem>
                                  <SelectItem value="popup">Popup</SelectItem>
                                  <SelectItem value="fullscreen">
                                    Fullscreen
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={widgetForm.control}
                          name="font"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="font">Font</Label>
                              <FormControl>
                                <Input id="font" placeholder="sans-serif" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={widgetForm.control}
                            name="bgColor"
                            render={({ field }) => (
                              <FormItem>
                                <Label htmlFor="bgColor">Background Color</Label>
                                <FormControl>
                                  <Input type="color" id="bgColor" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={widgetForm.control}
                            name="textColor"
                            render={({ field }) => (
                              <FormItem>
                                <Label htmlFor="textColor">Text Color</Label>
                                <FormControl>
                                  <Input type="color" id="textColor" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Embed Code and Preview */}
        <div className="space-y-8">
          {/* Embed Code */}
          <Suspense fallback={<LoadingCard />}>
            <AnimatePresence>
              {clientCreated && clientId && (
                <motion.div
                  key="embed-code"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Embed Code</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={embedCode}
                        rows={8}
                        readOnly
                        className="font-mono"
                      />
                      <Button onClick={handleCopy} className="w-full">
                        <Copy className="w-4 h-4 mr-2" /> Copy Script
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>

          {/* Live Preview */}
          <Suspense fallback={<LoadingCard />}>
            <AnimatePresence>
              {clientCreated && clientId && (
                <motion.div
                  key="live-preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Live Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="p-4 rounded"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          fontFamily: font,
                          textAlign: "center",
                        }}
                      >
                        {type === "banner" && <p>This is a banner preview</p>}
                        {type === "popup" && <p>This is a popup preview</p>}
                        {type === "fullscreen" && (
                          <p>This is a fullscreen preview</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </div>
    </div>
  );
}