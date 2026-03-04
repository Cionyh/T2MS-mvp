"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (errorParam === "INVALID_TOKEN") {
      toast.error("This reset link is invalid or has expired. Please request a new one.");
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token. Please use the link from your email.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await resetPassword({
        newPassword: password,
        token,
      });
      if (error) {
        toast.error(error.message ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      toast.success("Password updated. You can sign in now.");
      setTimeout(() => router.push("/sign-in"), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (errorParam === "INVALID_TOKEN") {
    return (
      <Card className="max-w-md w-full rounded-[3em]">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Invalid or expired link</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            This password reset link is invalid or has expired. Please request a new one from the sign-in page.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-0">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary underline"
          >
            Request new reset link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className="max-w-md w-full rounded-[3em]">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Reset your password</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Use the link from your email to reset your password. If you don't have it, request a new link.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-0">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary underline"
          >
            Request reset link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="max-w-md w-full rounded-[3em]">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Password updated</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Redirecting you to sign in...
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-0">
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-primary underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full rounded-[3em]">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Set new password</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your new password below. It must be at least 6 characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              minLength={6}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-[3em]"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <Link
          href="/sign-in"
          className="text-sm text-muted-foreground hover:text-primary underline"
        >
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={<Card className="max-w-md w-full rounded-[3em]"><CardContent className="pt-6">Loading...</CardContent></Card>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
