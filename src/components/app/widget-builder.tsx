"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// PhoneInput removed - phone numbers are now managed separately
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "../magicui/dot-pattern";
import { cn } from "@/lib/utils";

// Schema: keyword optional so starter plan can omit it; growth plan requires it (validated in submit)
const clientSchema = z.object({
  name: z.string().min(2, { message: "Business Name must be at least 2 characters." }),
  domain: z.string().url({ message: "Invalid URL format. Include https:// or http://." }),
  keyword: z.string().optional(),
  websiteOwnership: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge that you own and/or have rights to this website.",
  }),
});

type ClientSchemaType = z.infer<typeof clientSchema>;

export default function ClientWidgetBuilder() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [plan, setPlan] = useState<string>("");
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPlanLoading(false);
      return;
    }
    fetch("/api/plan/usage")
      .then((r) => r.json())
      .then((data) => setPlan(data?.plan ?? "free"))
      .catch(() => setPlan("free"))
      .finally(() => setPlanLoading(false));
  }, [userId]);

  const isStarterPlan = plan === "starter";

  const form = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      domain: "",
      keyword: "",
      websiteOwnership: false,
    },
  });

  const { handleSubmit, formState } = form;
  const { isSubmitting } = formState;

  const handleCreateClient = async (values: ClientSchemaType) => {
    if (!userId) {
      toast.error("You must be logged in to register a site.");
      return;
    }
    if (planLoading) {
      toast.error("Loading your plan details. Please try again in a moment.");
      return;
    }
    // Client-side keyword validation is best-effort only. The API is the source of truth.
    // (Avoid blocking starter users if plan lookup is delayed or temporarily fails.)
    const kw = values.keyword?.trim();
    if (kw && !/^[A-Za-z0-9_]{1,50}$/.test(kw)) {
      toast.error("Keyword must be 1–50 characters, letters, numbers, or underscore only.");
      return;
    }

    const { websiteOwnership, keyword, ...rest } = values;

    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rest.name,
          domain: rest.domain,
          ...(isStarterPlan ? {} : { keyword: (keyword ?? "").trim().toUpperCase() }),
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

      toast.success("Site Registered Successfully");
      router.push(`/app/install-request?clientId=${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
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
              {!planLoading && !isStarterPlan && (
                <FormField
                  control={form.control}
                  name="keyword"
                  render={({ field }) => (
                    <FormItem>
                      <Label>SMS Keyword (e.g. BAKERY)</Label>
                      <FormControl>
                        <Input placeholder="BAKERY" {...field} maxLength={50} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        To post via text, send: <strong>{field.value || "KEYWORD"}: your message</strong>
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {/* Phone numbers are now added separately after client creation via phone management */}
              <FormField
                control={form.control}
                name="websiteOwnership"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label className="text-sm font-normal">
                        I acknowledge that I own and/or have rights to this website.
                      </Label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isSubmitting || planLoading}
                className="w-full text-foreground"
              >
                {planLoading ? "Loading plan..." : isSubmitting ? "Registering..." : "Register Site"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}