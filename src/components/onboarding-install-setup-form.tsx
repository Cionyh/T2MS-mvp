"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Wrench, Info, Eye, EyeOff } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ACCESS_METHOD, INSTALL_TYPE } from "@/lib/job-status";

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

const SMS_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

const setupSchema = z
  .object({
    websiteUrl: z.string().url({ message: "Invalid URL format. Include https:// or http://." }),
    platform: z.string().min(1, { message: "Platform selection is required." }),
    platformOther: z.string().optional(),
    preferredPlacement: z.string().optional(),
    accessMethod: z.enum([
      ACCESS_METHOD.TEMPORARY_LOGIN,
      ACCESS_METHOD.ADMIN_INVITE,
      ACCESS_METHOD.INSTRUCTIONS_ONLY,
    ]),
    tempLoginUrl: z.string().optional(),
    tempLoginUsername: z.string().optional(),
    tempLoginPassword: z.string().optional(),
    tempLoginExpiry: z.string().optional(),
    inviteEmail: z.string().optional(),
    inviteSender: z.string().optional(),
    instructions: z.string().optional(),
    notes: z.string().optional(),
    smsConsentChecked: z.boolean().refine((val) => val === true, {
      message: "You must confirm SMS consent to continue.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.accessMethod !== ACCESS_METHOD.TEMPORARY_LOGIN) return;
    const url = data.tempLoginUrl?.trim() ?? "";
    const username = data.tempLoginUsername?.trim() ?? "";
    const password = data.tempLoginPassword?.trim() ?? "";
    const expiry = data.tempLoginExpiry?.trim() ?? "";
    if (!url) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Admin URL is required.", path: ["tempLoginUrl"] });
    if (!username) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Username is required.", path: ["tempLoginUsername"] });
    if (!password) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required.", path: ["tempLoginPassword"] });
    if (!expiry) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Expiry date/time is required.", path: ["tempLoginExpiry"] });
  })
  .refine(
    (data) => {
      if (data.accessMethod === ACCESS_METHOD.ADMIN_INVITE) {
        return data.inviteEmail && data.inviteEmail.length > 0;
      }
      return true;
    },
    { message: "Invite email is required.", path: ["inviteEmail"] }
  )
  .refine(
    (data) => {
      if (data.accessMethod === ACCESS_METHOD.INSTRUCTIONS_ONLY) {
        return data.instructions && data.instructions.length > 0;
      }
      return true;
    },
    { message: "Instructions are required.", path: ["instructions"] }
  )
  .refine(
    (data) => {
      if (data.platform === "Other") {
        const other = (data.platformOther ?? "").trim();
        return other.length > 0;
      }
      return true;
    },
    { message: "Please specify your platform.", path: ["platformOther"] }
  );

type SetupFormValues = z.infer<typeof setupSchema>;

function LabelWithInfo({ label, info }: { label: string; info: string }) {
  return (
    <div className="flex items-center gap-2">
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full p-0.5"
            aria-label="More info"
          >
            <Info className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="max-w-xs text-sm" align="start">
          {info}
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface OnboardingInstallSetupFormProps {
  clientId: string;
  initialWebsiteUrl: string;
  onSuccess: () => void;
}

export function OnboardingInstallSetupForm({
  clientId,
  initialWebsiteUrl,
  onSuccess,
}: OnboardingInstallSetupFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showTempLoginPassword, setShowTempLoginPassword] = useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      websiteUrl: initialWebsiteUrl || "https://example.com",
      platform: "",
      platformOther: "",
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
    },
  });

  const accessMethod = form.watch("accessMethod");

  const handleSubmit = async (values: SetupFormValues) => {
    setSubmitting(true);
    try {
      let accessCredentials: Record<string, unknown> = {};
      if (values.accessMethod === ACCESS_METHOD.TEMPORARY_LOGIN) {
        accessCredentials = {
          adminUrl: values.tempLoginUrl,
          username: values.tempLoginUsername,
          password: values.tempLoginPassword,
          expiry: values.tempLoginExpiry,
        };
      } else if (values.accessMethod === ACCESS_METHOD.ADMIN_INVITE) {
        accessCredentials = {
          email: values.inviteEmail,
          sender: values.inviteSender || "installer@t2ms.com",
        };
      } else {
        accessCredentials = { steps: values.instructions };
      }

      const res = await fetch("/api/install-request/onboarding-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          websiteUrls: [values.websiteUrl?.trim() || initialWebsiteUrl],
          platform: values.platform === "Other" ? (values.platformOther || "").trim() : values.platform,
          installType: INSTALL_TYPE.SCRIPT,
          preferredPlacement: values.preferredPlacement || null,
          accessMethod: values.accessMethod,
          accessCredentials,
          notes: values.notes || null,
          smsConsentConfirmed: values.smsConsentChecked,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save install details");
      }
      toast.success("Install details saved. Taking you to your dashboard.");
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wrench className="h-5 w-5 text-amber-600" />
              Install setup
            </CardTitle>
            <CardDescription>
              Provide website and access details so we can install your widget. Once submitted, you&apos;ll go to your sites dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <LabelWithInfo
                        label="Website URL *"
                        info="The website address where you want the widget installed."
                      />
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <LabelWithInfo label="Platform *" info="Select the platform your website is built on." />
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLATFORMS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.value === "Other" && (
                        <FormField
                          control={form.control}
                          name="platformOther"
                          render={({ field: otherField }) => (
                            <FormItem className="mt-3">
                              <FormLabel>Specify platform *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Drupal, Magento" {...otherField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredPlacement"
                  render={({ field }) => (
                    <FormItem>
                      <LabelWithInfo
                        label="Preferred placement (optional)"
                        info="Where you'd like the widget on the page (e.g. bottom-right)."
                      />
                      <FormControl>
                        <Input placeholder="e.g. bottom-right" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessMethod"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-2">
                        <LabelWithInfo
                          label="Access method *"
                          info="Temporary login: provide short-term admin access. Admin invite: invite us as admin. Instructions only: install yourself using our instructions."
                        />
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="text-xs font-medium text-primary underline underline-offset-4 hover:no-underline"
                            >
                              Instructions to allow widget installation
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Instructions to allow widget installation</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 text-sm">
                              <div>
                                <p className="font-semibold">WordPress</p>
                                <ol className="list-decimal list-inside space-y-1 mt-1">
                                  <li>Log in to your WordPress dashboard.</li>
                                  <li>Go to <strong>Users → Add New User</strong>.</li>
                                  <li>Enter: <code>install@t2ms.biz</code>.</li>
                                  <li>Set the role to <strong>Administrator</strong>.</li>
                                  <li>Click <strong>Add New User</strong>.</li>
                                </ol>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Important: We will not be able to install your widget until we receive the access invitation from WordPress.
                                </p>
                              </div>

                              <div>
                                <p className="font-semibold">Squarespace</p>
                                <ol className="list-decimal list-inside space-y-1 mt-1">
                                  <li>Log in to your Squarespace account.</li>
                                  <li>Go to <strong>Settings → Permissions</strong>.</li>
                                  <li>Click <strong>Invite Contributor</strong>.</li>
                                  <li>Enter: <code>install@t2ms.biz</code>.</li>
                                  <li>Assign the appropriate admin-level permission needed for installation.</li>
                                  <li>Send the invite.</li>
                                </ol>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Important: We will not be able to install your widget until we receive the access invitation from Squarespace.
                                </p>
                              </div>

                              <div>
                                <p className="font-semibold">Wix</p>
                                <ol className="list-decimal list-inside space-y-1 mt-1">
                                  <li>Log in to your Wix account.</li>
                                  <li>Go to <strong>Settings → Roles &amp; Permissions</strong>.</li>
                                  <li>Click <strong>Invite People</strong>.</li>
                                  <li>Enter: <code>install@t2ms.biz</code>.</li>
                                  <li>Assign admin/editor permissions needed for installation.</li>
                                  <li>Send the invite.</li>
                                </ol>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Important: We will not be able to install your widget until we receive the access invitation from Wix.
                                </p>
                              </div>

                              <div>
                                <p className="font-semibold">Shopify</p>
                                <ol className="list-decimal list-inside space-y-1 mt-1">
                                  <li>Log in to your Shopify admin.</li>
                                  <li>Go to <strong>Settings → Users and Permissions</strong>.</li>
                                  <li>Click <strong>Add Staff</strong>.</li>
                                  <li>Enter: <code>install@t2ms.biz</code>.</li>
                                  <li>Grant the permissions needed for theme/widget installation.</li>
                                  <li>Send the invite.</li>
                                </ol>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Important: We will not be able to install your widget until we receive the access invitation from Shopify.
                                </p>
                              </div>

                              <div>
                                <p className="font-semibold">Webflow</p>
                                <ol className="list-decimal list-inside space-y-1 mt-1">
                                  <li>Log in to your Webflow account.</li>
                                  <li>Open your site settings.</li>
                                  <li>Go to workspace/site access settings.</li>
                                  <li>Invite <code>install@t2ms.biz</code> with the permissions needed for installation.</li>
                                </ol>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Important: We will not be able to install your widget until we receive the access invitation from Webflow.
                                </p>
                              </div>

                              <div>
                                <p className="font-semibold">GoDaddy Website Builder</p>
                                <ol className="list-decimal list-inside space-y-1 mt-1">
                                  <li>Log in to your GoDaddy account.</li>
                                  <li>Open your website product/dashboard.</li>
                                  <li>Go to user or collaborator access if available.</li>
                                  <li>Invite <code>install@t2ms.biz</code> with the permissions needed for installation.</li>
                                </ol>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Important: We will not be able to install your widget until we receive the access invitation from GoDaddy.
                                </p>
                              </div>

                              <div>
                                <p className="font-semibold">Joomla</p>
                                <ol className="list-decimal list-inside space-y-1 mt-1">
                                  <li>Log in to your Joomla administrator panel.</li>
                                  <li>Go to <strong>Users</strong>.</li>
                                  <li>Add a new user with <code>install@t2ms.biz</code>.</li>
                                  <li>Assign administrator-level access needed for installation.</li>
                                </ol>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Important: We will not be able to install your widget until we receive the access invitation from Joomla.
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={ACCESS_METHOD.TEMPORARY_LOGIN} id="temp-login" />
                            <Label htmlFor="temp-login">Temporary login</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={ACCESS_METHOD.ADMIN_INVITE} id="admin-invite" />
                            <Label htmlFor="admin-invite">Admin invite</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={ACCESS_METHOD.INSTRUCTIONS_ONLY} id="instructions" />
                            <Label htmlFor="instructions">Instructions only</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {accessMethod === ACCESS_METHOD.TEMPORARY_LOGIN && (
                  <div className="space-y-4 pl-6 border-l-2">
                    <FormField
                      control={form.control}
                      name="tempLoginUrl"
                      render={({ field }) => (
                        <FormItem>
                          <LabelWithInfo label="Admin URL *" info="URL to your site's admin (e.g. WordPress wp-admin)." />
                          <FormControl>
                            <Input placeholder="https://yoursite.com/wp-admin" autoComplete="off" {...field} />
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
                          <LabelWithInfo label="Username *" info="Admin username for temporary access." />
                          <FormControl>
                            <Input autoComplete="off" {...field} />
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
                          <LabelWithInfo label="Password *" info="Admin password for temporary access." />
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showTempLoginPassword ? "text" : "password"}
                                autoComplete="new-password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowTempLoginPassword(!showTempLoginPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showTempLoginPassword ? "Hide password" : "Show password"}
                              >
                                {showTempLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
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
                          <LabelWithInfo label="Expiry *" info="When the temporary login expires." />
                          <FormControl>
                            <Input type="datetime-local" autoComplete="off" {...field} />
                          </FormControl>
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
                          <LabelWithInfo label="Invite email *" info="Email to invite Text2MySite as admin." />
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
                          <LabelWithInfo label="Sender (optional)" info="Email that will send the invite." />
                          <FormControl>
                            <Input placeholder="installer@t2ms.com" {...field} />
                          </FormControl>
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
                          <LabelWithInfo label="Instructions *" info="Step-by-step instructions for installing the script." />
                          <FormControl>
                            <Textarea placeholder="1. Go to…&#10;2. Click…" className="min-h-[120px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <LabelWithInfo label="Notes (optional)" info="Any special requirements or constraints." />
                      <FormControl>
                        <Textarea placeholder="Any constraints or special requirements…" className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 p-4 border-2 rounded-lg bg-muted/50">
                  <FormField
                    control={form.control}
                    name="smsConsentChecked"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <LabelWithInfo label="SMS consent *" info="Required to confirm permission to send SMS via T2MS." />
                          <FormDescription className="text-sm">{SMS_CONSENT_TEXT}</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full rounded-[3em] !bg-amber-600 hover:!bg-amber-700 !text-white">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Complete and go to my sites"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
