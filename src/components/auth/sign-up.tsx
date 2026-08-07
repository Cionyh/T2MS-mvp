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
import { useEffect, useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  getStoredReferralCode,
  normalizeReferralCode,
  storeReferralCode,
} from "@/lib/referral";
import {
  formatCouponPlan,
  normalizeCouponCode,
  storeCouponCode,
} from "@/lib/coupons";

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

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Pakistan",
  "Philippines",
  "United Arab Emirates",
  "Saudi Arabia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Brazil",
  "Mexico",
  "South Africa",
  "Other",
] as const;

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

const CANADA_PROVINCES_AND_TERRITORIES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
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
  const [activeReferralCode, setActiveReferralCode] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [validatedCoupon, setValidatedCoupon] = useState<{
    code: string;
    plan: string;
    durationInMonths: number;
    remainingUses: number;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const selectedCountry = form.watch("country");
  const isUSSelected = selectedCountry === "United States";
  const isCanadaSelected = selectedCountry === "Canada";
  const useRegionDropdown = isUSSelected || isCanadaSelected;
  const regionOptions = isUSSelected
    ? US_STATES
    : isCanadaSelected
      ? CANADA_PROVINCES_AND_TERRITORIES
      : [];

  useEffect(() => {
    if (!useRegionDropdown && form.getValues("state")) {
      form.setValue("state", "");
    }
  }, [useRegionDropdown, form]);

  useEffect(() => {
    const queryRef = normalizeReferralCode(searchParams.get("ref"));
    const storedRef = getStoredReferralCode();
    const referral = queryRef || storedRef;
    if (referral) {
      setActiveReferralCode(referral);
      storeReferralCode(referral);
    }
  }, [searchParams]);

  const validateCouponCode = async () => {
    const normalized = normalizeCouponCode(couponCode);

    if (!normalized) {
      setValidatedCoupon(null);
      storeCouponCode(null);
      toast.error("Enter a valid coupon code.");
      return false;
    }

    try {
      setCouponValidating(true);
      const res = await fetch(
        `/api/coupon-codes/validate?code=${encodeURIComponent(normalized)}`
      );
      const data = await res.json();

      if (!res.ok || !data?.valid || !data?.coupon) {
        setValidatedCoupon(null);
        storeCouponCode(null);
        toast.error(data?.error || "Coupon code is invalid.");
        return false;
      }

      setCouponCode(data.coupon.code);
      setValidatedCoupon({
        code: data.coupon.code,
        plan: data.coupon.plan,
        durationInMonths: data.coupon.durationInMonths,
        remainingUses: data.coupon.remainingUses,
      });
      storeCouponCode(data.coupon.code);
      toast.success("Coupon code validated.");
      return true;
    } catch {
      setValidatedCoupon(null);
      storeCouponCode(null);
      toast.error("Failed to validate coupon code.");
      return false;
    } finally {
      setCouponValidating(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    if (!smsOptIn || !termsAccepted) {
      const message = !smsOptIn && !termsAccepted
        ? "Check both required boxes: SMS consent and Terms of Use."
        : !smsOptIn
          ? "You must consent to the SMS Terms & Conditions to continue."
          : "You must accept the Terms of Use, Privacy Policy, and SMS Terms to continue.";
      setConsentError(message);
      toast.error(message);
      return;
    }
    setConsentError(null);

    setLoading(true);
    try {
      const normalizedCoupon = normalizeCouponCode(couponCode);
      if (normalizedCoupon) {
        const isCouponStillValid =
          validatedCoupon?.code === normalizedCoupon
            ? true
            : await validateCouponCode();

        if (!isCouponStillValid) {
          setLoading(false);
          return;
        }
      } else {
        storeCouponCode(null);
      }

      let validReferralCode: string | undefined;
      if (activeReferralCode) {
        const referralRes = await fetch(
          `/api/referral-codes/validate?code=${encodeURIComponent(activeReferralCode)}`
        );
        const referralData = await referralRes.json();
        if (referralData?.valid && referralData?.code) {
          validReferralCode = referralData.code;
        }
      }

      let onboardingPath = "/onboarding";
      try {
        const fromStorage =
          sessionStorage.getItem("t2ms_onboarding_plan") === "church";
        const fromUrl =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("plan") === "church";
        if (fromStorage || fromUrl) {
          onboardingPath = "/onboarding?plan=church";
          sessionStorage.setItem("t2ms_onboarding_plan", "church");
        }
      } catch {
        // ignore
      }

      const { data, error } = await signUp.email({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
        state: values.state || undefined,
        country: values.country || undefined,
        businessCategory: values.businessCategory || undefined,
        referralCode: validReferralCode,
        callbackURL: onboardingPath,
      });

      if (error) {
        const message =
          error.message ||
          (error.status === 422
            ? "An account with this email may already exist. Try signing in instead."
            : "Could not create your account. Please try again.");
        toast.error(message);
        return;
      }

      if (!data) {
        toast.error("Could not create your account. Please try again.");
        return;
      }

      if (validReferralCode) {
        storeReferralCode(null);
      }
      router.push(onboardingPath);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during sign-up."
      );
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = () => {
    toast.error("Please fix the highlighted fields above.");
    const firstKey = Object.keys(form.formState.errors)[0];
    if (firstKey) {
      const el = document.querySelector(`[name="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
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
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="grid gap-4">
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
              {activeReferralCode && (
                <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  Referral code applied: <span className="font-mono font-medium text-foreground">{activeReferralCode}</span>
                </div>
              )}
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
            <div className="grid gap-2">
              <Label htmlFor="coupon-code">Coupon Code (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon-code"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    const nextCode = e.target.value.toUpperCase();
                    setCouponCode(nextCode);
                    if (validatedCoupon?.code !== nextCode) {
                      setValidatedCoupon(null);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={validateCouponCode}
                  disabled={couponValidating}
                >
                  {couponValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validate"}
                </Button>
              </div>
              {validatedCoupon ? (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
                  {validatedCoupon.code} unlocks the {formatCouponPlan(validatedCoupon.plan)} plan free for{" "}
                  {validatedCoupon.durationInMonths} month(s).
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger id="country" className="w-full min-w-0">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
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
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="state">State / Province</Label>
                      {useRegionDropdown ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger id="state" className="w-full min-w-0">
                              <SelectValue
                                placeholder={
                                  isCanadaSelected ? "Select province/territory" : "Select state"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regionOptions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input
                            id="state"
                            placeholder="e.g. Ontario"
                            {...field}
                          />
                        </FormControl>
                      )}
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
                        <SelectTrigger className="w-full min-w-0">
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
                  onCheckedChange={(checked) => {
                    setSmsOptIn(checked === true);
                    if (checked) setConsentError(null);
                  }}
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
                  onCheckedChange={(checked) => {
                    setTermsAccepted(checked === true);
                    if (checked) setConsentError(null);
                  }}
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

            {consentError ? (
              <p className="text-sm text-destructive" role="alert">
                {consentError}
              </p>
            ) : !smsOptIn || !termsAccepted ? (
              <p className="text-xs text-muted-foreground">
                Both checkboxes above are required before you can create an account.
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full rounded-[3em] text-foreground"
              disabled={loading || !smsOptIn || !termsAccepted}
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

