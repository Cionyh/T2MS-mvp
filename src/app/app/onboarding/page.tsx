"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ACCESS_METHOD, INSTALL_TYPE } from "@/lib/job-status";

// Platform options
const PLATFORMS = [
  "WordPress",
  "Squarespace",
  "Google Sites",
  "Wix",
  "Shopify",
  "Webflow",
  "Custom HTML",
  "Other",
] as const;

// Onboarding form schema with conditional validation
const onboardingSchema = z
  .object({
    websiteUrls: z
      .array(z.string().url({ message: "Invalid URL format. Include https:// or http://." }))
      .min(1, { message: "At least one website URL is required." }),
    platform: z.string().min(1, { message: "Platform selection is required." }),
    installType: z.enum([INSTALL_TYPE.SCRIPT, INSTALL_TYPE.IFRAME]),
    preferredPlacement: z.string().optional(),
    accessMethod: z.enum([
      ACCESS_METHOD.TEMPORARY_LOGIN,
      ACCESS_METHOD.ADMIN_INVITE,
      ACCESS_METHOD.INSTRUCTIONS_ONLY,
    ]),
    // Temporary Login fields
    tempLoginUrl: z.string().optional(),
    tempLoginUsername: z.string().optional(),
    tempLoginPassword: z.string().optional(),
    tempLoginExpiry: z.string().optional(),
    // Admin Invite fields
    inviteEmail: z.string().optional(),
    inviteSender: z.string().optional(),
    // Instructions Only fields
    instructions: z.string().optional(),
    // Notes
    notes: z.string().optional(),
    // SMS Consent
    smsConsentChecked: z.boolean().refine((val) => val === true, {
      message: "You must confirm SMS consent to continue.",
    }),
    smsConsentText: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.accessMethod === ACCESS_METHOD.TEMPORARY_LOGIN) {
        return (
          data.tempLoginUrl &&
          data.tempLoginUrl.length > 0 &&
          data.tempLoginUsername &&
          data.tempLoginUsername.length > 0 &&
          data.tempLoginPassword &&
          data.tempLoginPassword.length > 0 &&
          data.tempLoginExpiry &&
          data.tempLoginExpiry.length > 0
        );
      }
      return true;
    },
    {
      message: "All temporary login fields are required.",
      path: ["tempLoginUrl"],
    }
  )
  .refine(
    (data) => {
      if (data.accessMethod === ACCESS_METHOD.ADMIN_INVITE) {
        return data.inviteEmail && data.inviteEmail.length > 0;
      }
      return true;
    },
    {
      message: "Invite email is required.",
      path: ["inviteEmail"],
    }
  )
  .refine(
    (data) => {
      if (data.accessMethod === ACCESS_METHOD.INSTRUCTIONS_ONLY) {
        return data.instructions && data.instructions.length > 0;
      }
      return true;
    },
    {
      message: "Instructions are required.",
      path: ["instructions"],
    }
  )
  .refine(
    (data) => {
      if (data.smsConsentChecked) {
        const consentText =
          "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";
        return data.smsConsentText === consentText;
      }
      return true;
    },
    {
      message: "SMS consent text must match exactly.",
      path: ["smsConsentText"],
    }
  );

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const SMS_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

export default function OnboardingPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [smsConsentText, setSmsConsentText] = useState("");

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      websiteUrls: [""],
      platform: "",
      installType: INSTALL_TYPE.SCRIPT,
      preferredPlacement: "",
      accessMethod: ACCESS_METHOD.TEMPORARY_LOGIN,
      tempLoginUrl: "",
      tempLoginUsername: "",
      tempLoginPassword: "",
      tempLoginExpiry: "",
      inviteEmail: "",
      inviteSender: "",
      instructions: "",
      notes: "",
      smsConsentChecked: false,
      smsConsentText: "",
    },
  });

  const accessMethod = form.watch("accessMethod");
  const smsConsentChecked = form.watch("smsConsentChecked");

  const addWebsiteUrl = () => {
    const currentUrls = form.getValues("websiteUrls");
    form.setValue("websiteUrls", [...currentUrls, ""]);
  };

  const removeWebsiteUrl = (index: number) => {
    const currentUrls = form.getValues("websiteUrls");
    if (currentUrls.length > 1) {
      form.setValue(
        "websiteUrls",
        currentUrls.filter((_, i) => i !== index)
      );
    }
  };

  const onSubmit = async (values: OnboardingFormValues) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to complete onboarding.");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare access credentials based on access method
      let accessCredentials: any = {};

      if (values.accessMethod === ACCESS_METHOD.TEMPORARY_LOGIN) {
        accessCredentials = {
          method: ACCESS_METHOD.TEMPORARY_LOGIN,
          adminUrl: values.tempLoginUrl,
          username: values.tempLoginUsername,
          password: values.tempLoginPassword,
          expiry: values.tempLoginExpiry,
        };
      } else if (values.accessMethod === ACCESS_METHOD.ADMIN_INVITE) {
        accessCredentials = {
          method: ACCESS_METHOD.ADMIN_INVITE,
          email: values.inviteEmail,
          sender: values.inviteSender || "installer@t2ms.com",
        };
      } else if (values.accessMethod === ACCESS_METHOD.INSTRUCTIONS_ONLY) {
        accessCredentials = {
          method: ACCESS_METHOD.INSTRUCTIONS_ONLY,
          steps: values.instructions,
        };
      }

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteUrls: values.websiteUrls.filter((url) => url.trim() !== ""),
          platform: values.platform,
          installType: values.installType,
          preferredPlacement: values.preferredPlacement || null,
          accessMethod: values.accessMethod,
          accessCredentials,
          notes: values.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit onboarding");
      }

      toast.success("Onboarding completed! Your install job has been created.");
      router.push("/app");
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Setup</CardTitle>
          <CardDescription>
            Provide the following information to get your widget installed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Website URLs */}
              <FormField
                control={form.control}
                name="websiteUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL(s) *</FormLabel>
                    <FormDescription>
                      Enter the URL(s) where you want the widget installed
                    </FormDescription>
                    {field.value.map((url, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => {
                              const newUrls = [...field.value];
                              newUrls[index] = e.target.value;
                              field.onChange(newUrls);
                            }}
                          />
                        </FormControl>
                        {field.value.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeWebsiteUrl(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addWebsiteUrl}
                      className="mt-2"
                    >
                      Add Another URL
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Platform Selection */}
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Install Type */}
              <FormField
                control={form.control}
                name="installType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Install Type *</FormLabel>
                    <FormDescription>
                      Script embed works for most sites. iFrame embed is for restricted platforms
                      like Google Sites.
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={INSTALL_TYPE.SCRIPT} id="script" />
                          <Label htmlFor="script">Script Embed (Standard)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={INSTALL_TYPE.IFRAME} id="iframe" />
                          <Label htmlFor="iframe">iFrame Embed (Restricted Platforms)</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preferred Placement */}
              <FormField
                control={form.control}
                name="preferredPlacement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Placement (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Bottom right corner, Footer, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Access Method */}
              <FormField
                control={form.control}
                name="accessMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Method *</FormLabel>
                    <FormDescription>
                      How will our installer access your website?
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={ACCESS_METHOD.TEMPORARY_LOGIN}
                            id="temp-login"
                          />
                          <Label htmlFor="temp-login">Temporary Login</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={ACCESS_METHOD.ADMIN_INVITE}
                            id="admin-invite"
                          />
                          <Label htmlFor="admin-invite">Admin Invite</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={ACCESS_METHOD.INSTRUCTIONS_ONLY}
                            id="instructions"
                          />
                          <Label htmlFor="instructions">Instructions Only</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Access Method Fields */}
              {accessMethod === ACCESS_METHOD.TEMPORARY_LOGIN && (
                <div className="space-y-4 pl-6 border-l-2">
                  <FormField
                    control={form.control}
                    name="tempLoginUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin URL *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yoursite.com/wp-admin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tempLoginUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tempLoginPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tempLoginExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date/Time *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormDescription>
                          When should this temporary access expire?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {accessMethod === ACCESS_METHOD.ADMIN_INVITE && (
                <div className="space-y-4 pl-6 border-l-2">
                  <FormField
                    control={form.control}
                    name="inviteEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address to Invite *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="installer@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inviteSender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invite Sender (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="installer@t2ms.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email address that will send the invite (defaults to installer@t2ms.com)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {accessMethod === ACCESS_METHOD.INSTRUCTIONS_ONLY && (
                <div className="pl-6 border-l-2">
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explicit Steps *</FormLabel>
                        <FormDescription>
                          Provide detailed instructions for accessing your website
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="1. Go to...&#10;2. Click on...&#10;3. Enter..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Constraints (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information or constraints..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SMS Consent Gate */}
              <div className="space-y-4 p-4 border-2 rounded-lg bg-muted/50">
                <FormField
                  control={form.control}
                  name="smsConsentChecked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              setSmsConsentText("");
                              form.setValue("smsConsentText", "");
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-semibold">
                          SMS Consent Confirmation *
                        </FormLabel>
                        <FormDescription className="text-sm">
                          {SMS_CONSENT_TEXT}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {smsConsentChecked && (
                  <FormField
                    control={form.control}
                    name="smsConsentText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Type the consent text above to confirm: *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type the consent text exactly as shown above..."
                            className="min-h-[80px]"
                            value={smsConsentText}
                            onChange={(e) => {
                              setSmsConsentText(e.target.value);
                              field.onChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          You must type the consent text exactly as shown to proceed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Complete Onboarding"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/app")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
