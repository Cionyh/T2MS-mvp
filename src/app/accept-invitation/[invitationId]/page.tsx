"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, client, signUp } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type InvitationInfo = {
  id: string;
  email: string;
  status: string;
  role: string | null;
  expiresAt: string;
  organizationName: string;
};

export default function AcceptInvitationPage() {
  const params = useParams<{ invitationId: string }>();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<
    "checking" | "need-auth" | "creating-account" | "accepting" | "error"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const invitationId = params?.invitationId;

  useEffect(() => {
    const loadInvitation = async () => {
      if (!invitationId) {
        setStatus("error");
        setErrorMessage("Invalid invitation link.");
        return;
      }

      try {
        const res = await fetch(`/api/invitations/${invitationId}`);
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload?.error || "Invalid invitation link.");
        }

        const loadedInvitation = payload.invitation as InvitationInfo;

        if ((loadedInvitation.status ?? "").toLowerCase() !== "pending") {
          throw new Error("This invitation is no longer valid.");
        }

        if (new Date(loadedInvitation.expiresAt).getTime() < Date.now()) {
          throw new Error("This invitation has expired.");
        }

        setInvitation(loadedInvitation);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err?.message || "Failed to load invitation.");
      }
    };

    loadInvitation();
  }, [invitationId]);

  useEffect(() => {
    const run = async () => {
      if (!invitationId || !invitation) {
        return;
      }

      if (!session?.user?.id) {
        setStatus("need-auth");
        return;
      }

      if (session?.user?.email?.toLowerCase() !== invitation.email.toLowerCase()) {
        setStatus("error");
        setErrorMessage(
          `You are signed in as ${session?.user?.email}. Please sign in with ${invitation.email} to accept this invitation.`
        );
        return;
      }

      try {
        setStatus("accepting");
        // Use Better Auth organization plugin to accept the invitation for the logged-in user.
        const anyClient = client as any;
        const result = await anyClient.organization.acceptInvitation({
          invitationId,
        });
        if (result?.error) {
          throw new Error(result.error.message || "Failed to accept invitation");
        }
        toast.success("Invitation accepted. Redirecting to your dashboard.");
        router.replace("/app");
      } catch (err: any) {
        console.error("Error accepting invitation:", err);
        setStatus("error");
        setErrorMessage(err.message || "Failed to accept invitation.");
      }
    };

    if (!isPending && invitation) {
      run();
    }
  }, [invitationId, invitation, session?.user?.id, session?.user?.email, isPending, router]);

  const handleCreateAccount = async () => {
    if (!invitation) return;

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsCreatingAccount(true);
      setStatus("creating-account");

      await signUp.email({
        email: invitation.email,
        password,
        name: fullName.trim(),
        callbackURL: `/accept-invitation/${invitation.id}`,
        fetchOptions: {
          onError: (ctx) => {
            throw new Error(ctx.error.message || "Failed to create account.");
          },
          onSuccess: () => {
            toast.success("Account created. Finishing invitation...");
            router.refresh();
          },
        },
      });
    } catch (error: any) {
      setStatus("need-auth");
      toast.error(error.message || "Failed to create account.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  if (status === "checking" || isPending || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "need-auth") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join Your Team
            </CardTitle>
            <CardDescription>
              You&apos;ve been invited to join {invitation.organizationName} as{" "}
              {invitation.role ?? "member"}. Create your account with{" "}
              <span className="font-medium">{invitation.email}</span> to accept the invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full name</Label>
              <Input
                id="invite-name"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isCreatingAccount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-password">Set password</Label>
              <Input
                id="invite-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isCreatingAccount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-password-confirmation">Confirm password</Label>
              <Input
                id="invite-password-confirmation"
                type="password"
                placeholder="Re-enter your password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={isCreatingAccount}
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button className="w-full" onClick={handleCreateAccount} disabled={isCreatingAccount}>
                {isCreatingAccount ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account and join team"
                )}
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Already have an account? Sign in with <span className="font-medium">{invitation.email}</span>,
                then open this invitation link again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invitation
          </CardTitle>
          <CardDescription>
            {status === "accepting"
              ? "Accepting your invitation. Please wait..."
              : errorMessage || "There was a problem with this invitation."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "accepting" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Finishing setup…</span>
            </div>
          ) : (
            <Button asChild className="mt-2">
              <Link href="/sign-in">Go to sign in</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

