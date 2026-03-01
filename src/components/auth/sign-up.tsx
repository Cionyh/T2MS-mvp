"use client";
/* eslint-disable */


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

const BUSINESS_CATEGORIES = [
  "Apparel",
  "Beauty",
  "Health",
  "Food",
  "Entertainment",
  "Hospitality",
  "Travel",
  "Real Estate",
  "Legal",
  "Staffing",
  "Construction",
  "Photography",
  "Education",
  "Non-Profit / Faith-Based",
  "Professional Services",
  "Mobile Business",
] as const;

const signUpSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  passwordConfirmation: z.string(),
  state: z.string().optional(),
  country: z.string().optional(),
  businessCategory: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords do not match",
  path: ["passwordConfirmation"],
});

export function SignUp() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [smsTermsOpen, setSmsTermsOpen] = useState(false);
  const [cancellationPolicyOpen, setCancellationPolicyOpen] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      state: "",
      country: "",
      businessCategory: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    // Frontend validation for mandatory checkboxes
    if (!smsOptIn) {
      toast.error("You must consent to agree to the SMS Terms & Conditions to continue.");
      return;
    }
    if (!termsAccepted) {
      toast.error("You must accept the terms and conditions to continue.");
      return;
    }

    setLoading(true);
    try {
      await signUp.email({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
        state: values.state || undefined,
        country: values.country || undefined,
        businessCategory: values.businessCategory || undefined,
        callbackURL: "/onboarding",
        fetchOptions: {
          onResponse: () => {
            setLoading(false);
          },
          onRequest: () => {
            setLoading(true);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async () => {
            router.push("/onboarding");
          },
        },
      });
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign-up.");
      setLoading(false);
    }
  };

  return (
    <Card className="z-50  rounded-[3em] max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign Up | T2MS</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your information to create an account
        </CardDescription>
        <p className="text-xs text-muted-foreground mt-2">
          (*) Required
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="first-name">First name *</Label>
                      <FormControl>
                        <Input
                          id="first-name"
                          placeholder="Max"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="last-name">Last name *</Label>
                      <FormControl>
                        <Input
                          id="last-name"
                          placeholder="Robinson"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email *</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="state">State</Label>
                      <FormControl>
                        <Input
                          id="state"
                          placeholder="e.g. California"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="country">Country</Label>
                      <FormControl>
                        <Input
                          id="country"
                          placeholder="e.g. United States"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="businessCategory"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="businessCategory">Business Category</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUSINESS_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">Password *</Label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password_confirmation"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Confirm Password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SMS Opt-In Checkbox */}
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={smsOptIn}
                  onCheckedChange={(checked) => setSmsOptIn(checked === true)}
                  className="border-black dark:border-neutral-400 [&[data-state=checked]]:border-primary"
                  style={!smsOptIn ? { border: "1px solid black" } : undefined}
                />
                <Label className="text-sm">
                  I consent to the SMS Terms & Conditions. *
                </Label>
              </div>
              <Dialog open={smsTermsOpen} onOpenChange={setSmsTermsOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground underline text-left"
                  >
                    View SMS Terms & Conditions
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>SMS Terms & Conditions</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                    <p><strong>Opt-In (End-User Consent for SMS):</strong></p>
                    <p>
                      By providing your mobile number and using Text2MySite™ (T2MS),
                      you consent to receive text messages related to website updates,
                      account activity, and service notifications. Message frequency
                      varies based on use. Standard message and data rates may apply.
                      Consent is not a condition of purchase. You may opt out of
                      receiving messages at any time by replying STOP. For help, reply
                      HELP.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="border-black dark:border-neutral-400 [&[data-state=checked]]:border-primary"
                  style={!termsAccepted ? { border: "1px solid black" } : undefined}
                />
                <Label className="text-sm">
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-primary hover:underline">
                    Terms of Use
                  </Link>
                  ,{" "}
                  <Link href="/legal/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  , and{" "}
                  <Link href="/legal/sms-terms" className="text-primary hover:underline">
                    SMS Terms & Conditions
                  </Link>
                  . *
                </Label>
              </div>
              <Dialog open={cancellationPolicyOpen} onOpenChange={setCancellationPolicyOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground underline text-left"
                  >
                    View Cancellation Policy
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Cancellation Policy</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                    <p><strong>Opt-Out / Client Cancellation (Business Customers of T2MS):</strong></p>
                    <p>
                      Clients may cancel their T2MS account at any time by providing written
                      notice to{" "}
                      <a
                        href="mailto:support@t2ms.biz"
                        className="text-primary hover:underline"
                      >
                        support@t2ms.biz
                      </a>
                      . Account cancellation requests must be received at least 10 business
                      days prior to the next billing cycle to avoid additional charges.
                      In the event of non-payment, T2MS reserves the right to suspend or
                      terminate services immediately. Clients remain responsible for any
                      unpaid balances accrued prior to cancellation or suspension.
                      Once an account is cancelled, associated numbers, keywords, and content
                      may be permanently deleted and cannot be recovered.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Button
              type="submit"
              className="w-full rounded-[3em] text-foreground"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Create an account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}

