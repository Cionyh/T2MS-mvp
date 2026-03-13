"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, client } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AcceptInvitationPage() {
  const params = useParams<{ invitationId: string }>();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "need-auth" | "accepting" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const invitationId = params?.invitationId;
      if (!invitationId) {
        setStatus("error");
        setErrorMessage("Invalid invitation link.");
        return;
      }

      if (!session?.user?.id) {
        setStatus("need-auth");
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

    if (!isPending) {
      run();
    }
  }, [params, session?.user?.id, isPending, router]);

  if (status === "checking" || isPending) {
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
              You&apos;ve been invited to join an organization on Text2MySite. Create your account or sign in to accept
              the invitation and access the shared dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/sign-up">Create an account</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                After signing in, revisit this invitation link to finish joining your team.
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

