"use client";

import { useState } from "react";
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
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "../magicui/dot-pattern";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Client validation schema
const clientSchema = z.object({
  name: z.string().min(2, { message: "Business Name must be at least 2 characters." }),
  domain: z.string().url({ message: "Invalid URL format. Include https:// or http://." }),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, {
    message: "Phone must be in E.164 format (e.g. +14155552671)",
  }),
});

type ClientSchemaType = z.infer<typeof clientSchema>;

export default function ClientWidgetBuilder() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [clientId, setClientId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      domain: "",
      phone: "",
    },
  });

  const { handleSubmit, formState } = form;
  const { isSubmitting } = formState;

  const embedCode = clientId
    ? `<script
  src="https://www.t2ms.biz/widget"
  data-client-id="${clientId}"
  data-api="https://www.t2ms.biz"
  defer
></script>`
    : "";

  const handleCreateClient = async (values: ClientSchemaType) => {
    if (!userId) {
      toast.error("You must be logged in to register a site.");
      return;
    }

    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          userId,
          // Send default widget settings if needed
          defaultType: "banner",
          defaultBgColor: "#222",
          defaultTextColor: "#fff",
          defaultFont: "sans-serif",
          defaultDismissAfter: 5000,
          pinned: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to register site");

      setClientId(data.id);
      setIsDialogOpen(true); // Open dialog immediately
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

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-5 h-5" /> Register Your Site
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(handleCreateClient)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label>Business Name</Label>
                    <FormControl>
                      <Input placeholder="Your Business Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <Label>Domain (e.g. https://example.com)</Label>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <Label>Phone (E.164)</Label>
                    <FormControl>
                      <Input placeholder="+14155552671" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full text-foreground">
                {isSubmitting ? "Registering..." : "Register Site"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Embed Code Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Embed Your Widget</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Copy the following script to embed your widget on your site.
            </p>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Textarea
              value={embedCode}
              readOnly
              className="font-mono text-sm h-40"
              placeholder="Embed code will appear here..."
            />
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button className="text-foreground" size="sm" onClick={() => (window.location.href = "/app/sites")}>
              Go to Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}