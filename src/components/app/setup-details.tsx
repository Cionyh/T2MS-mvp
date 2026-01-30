"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Wrench, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  "WordPress",
  "Squarespace",
  "Google Sites",
  "Wix",
  "Shopify",
  "Webflow",
  "Custom / HTML",
  "Other",
];

interface OnboardingData {
  planId: string;
  installAddonSku: string | null;
  installAddonStatus: string | null;
  websiteUrls: string[];
  platform: string | null;
  installType: string | null;
  preferredPlacement: string | null;
  accessMethod: string | null;
  notes: string | null;
  completedAt: string | null;
}

export function SetupDetailsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OnboardingData | null>(null);
  const [formValues, setFormValues] = useState({
    websiteUrls: "",
    platform: "",
    installType: "",
    preferredPlacement: "",
    accessMethod: "",
    notes: "",
  });

  useEffect(() => {
    fetchOnboarding();
  }, []);

  const fetchOnboarding = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding");
      const json = await res.json();
      if (json.onboarding) {
        setData(json.onboarding);
        setFormValues({
          websiteUrls: (json.onboarding.websiteUrls || []).join("\n"),
          platform: json.onboarding.platform || "",
          installType: json.onboarding.installType || "",
          preferredPlacement: json.onboarding.preferredPlacement || "",
          accessMethod: json.onboarding.accessMethod || "",
          notes: json.onboarding.notes || "",
        });
      } else {
        setData(null);
      }
    } catch {
      toast.error("Failed to load setup details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const urls = formValues.websiteUrls
        .split(/[\n,]/)
        .map((u) => u.trim())
        .filter(Boolean);
      const res = await fetch("/api/onboarding/setup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrls: urls,
          platform: formValues.platform || undefined,
          installType: formValues.installType || undefined,
          preferredPlacement: formValues.preferredPlacement || undefined,
          accessMethod: formValues.accessMethod || undefined,
          notes: formValues.notes || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      toast.success("Setup details updated");
      fetchOnboarding();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Setup Details
          </CardTitle>
          <CardDescription>
            Complete onboarding to add your website and install details here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t completed onboarding yet. Go through the onboarding flow to set up your account.
          </p>
          <Button className="mt-4" onClick={() => (window.location.href = "/onboarding")}>
            Complete onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasWidgetRequest = !!data.installAddonSku;

  return (
    <div className="space-y-6">
      {/* Onboarding / Setup Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Setup Details
          </CardTitle>
          <CardDescription>
            View and update the website and install details you provided during onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Website URL(s)</Label>
            <Textarea
              className="mt-1 min-h-[80px]"
              placeholder="https://example.com"
              value={formValues.websiteUrls}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, websiteUrls: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              One URL per line or comma-separated
            </p>
          </div>
          <div>
            <Label>Platform</Label>
            <Select
              value={formValues.platform || "none"}
              onValueChange={(v) =>
                setFormValues((prev) => ({ ...prev, platform: v === "none" ? "" : v }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select platform</SelectItem>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Install type</Label>
            <Select
              value={formValues.installType || "none"}
              onValueChange={(v) =>
                setFormValues((prev) => ({
                  ...prev,
                  installType: v === "none" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Script or iFrame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select type</SelectItem>
                <SelectItem value="script">Script embed</SelectItem>
                <SelectItem value="iframe">iFrame embed (restricted)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Preferred placement (optional)</Label>
            <Input
              className="mt-1"
              placeholder="e.g. bottom-right"
              value={formValues.preferredPlacement}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, preferredPlacement: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Access method</Label>
            <Select
              value={formValues.accessMethod || "none"}
              onValueChange={(v) =>
                setFormValues((prev) => ({
                  ...prev,
                  accessMethod: v === "none" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="How we access your site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select method</SelectItem>
                <SelectItem value="temporary_login">
                  Temporary login (URL, username, password, expiry)
                </SelectItem>
                <SelectItem value="admin_invite">Admin invite (email)</SelectItem>
                <SelectItem value="instructions">Instructions only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes / constraints (optional)</Label>
            <Textarea
              className="mt-1 min-h-[60px]"
              placeholder="Any special requirements…"
              value={formValues.notes}
              onChange={(e) => setFormValues((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Widget install requests */}
      {hasWidgetRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Widget install requests
            </CardTitle>
            <CardDescription>
              Your paid widget install add-on. Our team will install the widget on your site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {data.installAddonSku === "standard"
                    ? "Standard website install (script embed)"
                    : "Restricted platform install (Google Sites / iframe)"}
                </span>
                <span
                  className={`text-sm px-2 py-0.5 rounded ${
                    data.installAddonStatus === "paid"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {data.installAddonStatus === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Status: In queue — our team will reach out to complete the installation.
              </p>
              {data.websiteUrls && data.websiteUrls.length > 0 && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Target site(s):</span>{" "}
                  {data.websiteUrls.join(", ")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
