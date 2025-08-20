"use client";
/* eslint-disable */

import { useState, useMemo } from "react";
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
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "../magicui/dot-pattern";
import { cn } from "@/lib/utils";

// Client validation schema
const clientSchema = z.object({
  name: z.string().min(2, { message: "Business Name must be at least 2 characters." }),
  domain: z.string().url({ message: "Invalid URL format. Include https:// or http://." }),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, {
    message: "Phone must be in E.164 format (e.g. +14155552671)",
  }),
});

// Widget validation schema
const widgetSchema = z.object({
  type: z.enum(["banner", "popup", "fullscreen", "modal", "ticker"]),
  bgColor: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: "Invalid hex color code." }),
  textColor: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: "Invalid hex color code." }),
  font: z.string().min(1, { message: "Font is required." }),
});

type ClientSchemaType = z.infer<typeof clientSchema>;
type WidgetSchemaType = z.infer<typeof widgetSchema>;

// Skeleton loader
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

  // Client form
  const clientForm = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      domain: "",
      phone: "",
    },
  });

  // Widget form
  const widgetForm = useForm<WidgetSchemaType>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      type: "banner",
      bgColor: "#222",
      textColor: "#fff",
      font: "sans-serif",
    },
  });

  const { watch, reset: resetWidgetForm } = widgetForm;
  const type = watch("type");
  const bgColor = watch("bgColor");
  const textColor = watch("textColor");
  const font = watch("font");

  // ✅ Correct embed code with data-client-id
  const embedCode = useMemo(() => {
    if (!clientId) return "";
    return `<script
  src="https://www.t2ms.biz/widget"
  data-client-id="${clientId}"
  data-api="https://www.t2ms.biz"
  defer
></script>`;
  }, [clientId]);

  // Handle client creation
  const handleCreateClient = async (values: ClientSchemaType) => {
    if (!userId) {
      toast.error("You must be logged in to register a site.");
      return;
    }

    const widgetValues = widgetForm.getValues();

    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          userId,
          // ✅ Send widget defaults during client creation
          defaultType: widgetValues.type,
          defaultBgColor: widgetValues.bgColor,
          defaultTextColor: widgetValues.textColor,
          defaultFont: widgetValues.font,
          defaultDismissAfter: 5000,
          pinned: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to register site");

      setClientCreated(true);
      setClientId(data.id);

      // ✅ Reset widget form with server-returned defaults
      resetWidgetForm({
        type: data.defaultType,
        bgColor: data.defaultBgColor,
        textColor: data.defaultTextColor,
        font: data.defaultFont,
      });

      toast.success("Site registered successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleCopy = async () => {
    if (!embedCode) return;
    await navigator.clipboard.writeText(embedCode);
    toast.success("Embed script copied to clipboard!");
  };

  return (
    <div className="container mx-auto py-2 relative">
      <DotPattern
        className={cn(
          "-z-50",
          "[mask-image:radial-gradient(10000px_circle_at_center,white,transparent)]"
        )}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Forms */}
        <div className="space-y-8">
          {/* Client Registration */}
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
                          <Input id="name" placeholder="Your Business Name" {...field} />
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
                        <Label htmlFor="domain">Domain (e.g. https://example.com)</Label>
                        <FormControl>
                          <Input id="domain" placeholder="https://example.com" {...field} />
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
                        <Label htmlFor="phone">Phone (E.164)</Label>
                        <FormControl>
                          <Input id="phone" placeholder="+14155552671" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={clientForm.formState.isSubmitting} className="text-foreground">
                    Register Site
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Widget Configuration */}
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
                    <CardTitle className="text-xl">Configure Your Widget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...widgetForm}>
                      <form className="space-y-4">
                        <FormField
                          control={widgetForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <Label>Widget Type</Label>
                             <Select onValueChange={field.onChange} value={field.value}>
  <FormControl>
    <SelectTrigger>
      <SelectValue placeholder="Select type" />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    <SelectItem value="banner">Banner</SelectItem>
    <SelectItem value="popup">Popup</SelectItem>
    <SelectItem value="fullscreen">Fullscreen</SelectItem>
    <SelectItem value="modal">Modal</SelectItem>
    <SelectItem value="ticker">Ticker</SelectItem> {/* ✅ Added ticker */}
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
                              <Label>Font</Label>
                              <FormControl>
                                <Input placeholder="e.g. sans-serif, Arial" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={widgetForm.control}
                            name="bgColor"
                            render={({ field }) => (
                              <FormItem>
                                <Label>Background</Label>
                                <div className="flex items-center gap-2">
                                  <Input type="color" {...field} className="h-10 w-12 p-1" />
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={widgetForm.control}
                            name="textColor"
                            render={({ field }) => (
                              <FormItem>
                                <Label>Text Color</Label>
                                <div className="flex items-center gap-2">
                                  <Input type="color" {...field} className="h-10 w-12 p-1" />
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </div>
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

        {/* Right: Embed & Preview */}
        <div className="space-y-8">
          {/* Embed Code */}
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
                    <Textarea value={embedCode} rows={6} readOnly className="font-mono text-sm" />
                    <Button onClick={handleCopy} className="w-full">
                      <Copy className="w-4 h-4 mr-2" /> Copy Script
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Preview */}
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
  className="p-4 rounded text-center border"
  style={{ backgroundColor: bgColor, color: textColor, fontFamily: font }}
>
  {type === "banner" && (
    <p className="text-sm">This is how your banner widget will appear.</p>
  )}
  {type === "popup" && (
    <p className="text-sm">Popup widget: appears after a delay.</p>
  )}
  {type === "fullscreen" && (
    <p className="text-sm">Fullscreen overlay with announcement.</p>
  )}
  {type === "ticker" && (
  <div
    className="overflow-hidden whitespace-nowrap w-full relative"
    style={{ fontFamily: font, fontSize: "1.25em" }} // slightly larger
  >
    <div
      className="inline-block animate-tickerScroll"
      style={{ paddingLeft: "100%" }}
    >
      This is your ticker widget scrolling text…
    </div>
    <style jsx>{`
      @keyframes tickerScroll {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
      .animate-tickerScroll {
        display: inline-block;
        animation: tickerScroll 10s linear infinite;
      }
    `}</style>
  </div>
)}

  {type === "modal" && (
    <div className="relative">
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center rounded">
        <div
          className="bg-white p-4 rounded shadow-md text-black"
          style={{ fontFamily: font }}
        >
          <p className="text-sm">Modal widget preview</p>
          <button
            className="mt-2 px-3 py-1 border rounded hover:bg-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</div>

                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}