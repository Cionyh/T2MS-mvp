// app/not-authorized/page.tsx
"use client";

import { RetroGrid } from "@/components/magicui/retro-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NotAuthorizedPage() {
  const router = useRouter();

  const handleRedirect = () => {
    toast("Redirecting to the login page...");
    router.push("/sign-in");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
              <RetroGrid lightLineColor="orange" darkLineColor="orange" opacity={0.5} cellSize={15} className="absolute inset-0 z-0" />
    
      <Card className="max-w-sm w-full rounded-2xl bg-background">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-600">Access Denied</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-muted p-6">
          <p className="text-center text-foreground">
            Please log in with an account that has the necessary permissions to access this resource.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleRedirect} className="border-primary border-2 text-foreground hover:bg-primary/10">
              Go to User Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
