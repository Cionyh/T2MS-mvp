// app/dashboard/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  EyeOff,
  Copy,
  Loader2,
  ExternalLink,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { getHostedPageDomain } from "@/lib/hosted-page/constants";
import { getT2msSmsDisplayNumber } from "@/lib/sms-display";
import { SETUP_PATH_EMBED } from "@/lib/setup-path";
import { PostByTextCallout } from "./post-by-text-callout";
import { motion, Variants } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import { EmbedDialog } from "./embed-dialog";
import { IframeDialog } from "./iframe-dialog";
import { InstallationGuideDialog } from "./installation-guide-dialog"; 
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";
import { PhoneNumberManagement } from "./phone-number-management";
import { Badge } from "@/components/ui/badge";
import { HostedPageSettings } from "./hosted-page-settings";
import {
  isPlaceholderDomain,
  siteReadyForWidget,
  getWidgetSetupGaps,
} from "@/lib/client-setup";
import { planRequiresSmsKeyword } from "@/lib/plan-keyword";

// Widget type instructions
const widgetTypeInstructions = {
  banner: "Displays a horizontal banner at the top or bottom of the page. Great for announcements and promotions.",
  popup: "Shows a small popup notification in the corner of the screen. Perfect for alerts and quick messages.",
  fullscreen: "Covers the entire screen with your message. Ideal for important announcements or maintenance notices.",
  modal: "Displays a centered dialog box that requires user interaction. Best for confirmations and detailed information.",
  ticker: "Creates a scrolling text banner that moves across the screen. Great for news updates and live information."
};

// Font options for widget (T2MS font styles list)
const FONT_OPTIONS = [
  { name: "Helvetica", value: "Helvetica, sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { name: "Impact", value: "Impact, sans-serif" },
  { name: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
  { name: "Lucida Console", value: "'Lucida Console', monospace" },
  { name: "Palatino Linotype", value: "'Palatino Linotype', serif" },
  { name: "Tahoma", value: "Tahoma, sans-serif" },
  { name: "MS Sans", value: "'MS Sans Serif', sans-serif" },
  { name: "MS Serif", value: "'MS Serif', serif" },
  { name: "New York", value: "'New York', serif" },
  { name: "Book Antiqua", value: "'Book Antiqua', serif" },
  { name: "Garamond", value: "'Garamond', serif" },
  { name: "Century Gothic", value: "'Century Gothic', sans-serif" },
] as const;

// Match the Prisma Client model exactly
interface Website {
  pinned: boolean;
  id: string;
  name: string;
  domain: string;
  keyword?: string | null;
  organizationId?: string;
  phoneNumbers?: Array<{
    id: string;
    phone: string;
    verified: boolean;
  }>;
  installJob?: { id: string; status: string; platform?: string | null } | null;
  defaultType?: string;
  defaultBgColor?: string;
  defaultTextColor?: string;
  defaultFont?: string;
  defaultDismissAfter?: number;
  widgetConfig?: any; // JSON object containing widget configuration
  hostedSlug?: string | null;
  hostedEnabled?: boolean;
}

const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

interface DashboardClientProps {
  userId?: string;
}

export default function DashboardClient({ userId }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWebsiteId, setEditingWebsiteId] = useState<string | null>(null);

  // Editable fields
  const [editedName, setEditedName] = useState("");
  const [editedDomain, setEditedDomain] = useState("");
  const [editedKeyword, setEditedKeyword] = useState("");
  const [editedDefaultType, setEditedDefaultType] = useState("banner");
  const [editedDefaultBgColor, setEditedDefaultBgColor] = useState("#222");
  const [editedDefaultTextColor, setEditedDefaultTextColor] = useState("#fff");
  const [editedDefaultFont, setEditedDefaultFont] = useState("sans-serif");
  const [editedDefaultDismissAfter, setEditedDefaultDismissAfter] = useState<number>(5000);
  const [useDismissAfter, setUseDismissAfter] = useState(false);

  // Widget configuration state
  const [logoUrl, setLogoUrl] = useState("");
  const [companyWebsiteLink, setCompanyWebsiteLink] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [widgetPosition, setWidgetPosition] = useState("top-right");
  const [animationType, setAnimationType] = useState("fade");
  const [animationDuration, setAnimationDuration] = useState(300);
  const [fontSize, setFontSize] = useState(14);
  const [mobileFontSize, setMobileFontSize] = useState<number | "">("");
  const [attachImage, setAttachImage] = useState("");
  const [presetText, setPresetText] = useState("");
  const [iframeWidth, setIframeWidth] = useState("100%");
  const [iframeHeight, setIframeHeight] = useState("100vh");
  const [logoUploading, setLogoUploading] = useState(false);
  const [backgroundUploading, setBackgroundUploading] = useState(false);
  const [attachImageUploading, setAttachImageUploading] = useState(false);

  const [showClientId, setShowClientId] = useState<Record<string, boolean>>({});
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [iframeDialogOpen, setIframeDialogOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [hostedSettingsOpen, setHostedSettingsOpen] = useState(false);
  const [installationGuideOpen, setInstallationGuideOpen] = useState(false);
  const [installationGuideClientId, setInstallationGuideClientId] = useState<string | null>(null);
  const [installationGuideSiteName, setInstallationGuideSiteName] = useState<string>("");
  const [fontStylesDialogOpen, setFontStylesDialogOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [plan, setPlan] = useState<string>("");
  const [setupPath, setSetupPath] = useState<string | null>(null);

  // Prompt to add website domain + SMS keyword before enabling widget
  const [widgetSetupOpen, setWidgetSetupOpen] = useState(false);
  const [widgetSetupSite, setWidgetSetupSite] = useState<Website | null>(null);
  const [widgetSetupDomain, setWidgetSetupDomain] = useState("");
  const [widgetSetupKeyword, setWidgetSetupKeyword] = useState("");
  const [widgetSetupSaving, setWidgetSetupSaving] = useState(false);
  const [widgetSetupEnableAfter, setWidgetSetupEnableAfter] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch("/api/plan/usage")
      .then((r) => r.json())
      .then((data) => setPlan(data?.plan ?? "free"))
      .catch(() => setPlan("free"));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((data) => setSetupPath(data.setupPath ?? null))
      .catch(() => setSetupPath(null));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchWebsites = async () => {
      setLoading(true);
      const res = await fetch(`/api/client`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setWebsites(data);
      setLoading(false);
    };

    fetchWebsites();
  }, [userId]);

  // Clean URL when landing from onboarding with installChoice=1
  useEffect(() => {
    const installChoice = searchParams.get("installChoice");
    const clientId = searchParams.get("clientId");
    if (installChoice === "1" && clientId) {
      toast.success("Site registered — open install instructions to finish setup.");
      window.history.replaceState({}, "", "/app/sites");
      setInstallationGuideClientId(clientId);
      setInstallationGuideOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!installationGuideClientId || websites.length === 0) return;
    const site = websites.find((w) => w.id === installationGuideClientId);
    if (site) setInstallationGuideSiteName(site.name);
  }, [installationGuideClientId, websites]);

  const openWidgetSetup = (website: Website, enableAfter = false) => {
    setWidgetSetupSite(website);
    setWidgetSetupDomain(isPlaceholderDomain(website.domain) ? "" : website.domain);
    setWidgetSetupKeyword(website.keyword ?? "");
    setWidgetSetupEnableAfter(enableAfter);
    setWidgetSetupOpen(true);
  };

  const handleWidgetSetupSave = async () => {
    if (!widgetSetupSite) return;
    const domain = widgetSetupDomain.trim();
    const keywordRequired = planRequiresSmsKeyword(plan);
    // Only multi-site plans collect keyword in this dialog
    const keyword = keywordRequired
      ? widgetSetupKeyword.trim().toUpperCase()
      : "";

    if (!domain) {
      toast.error("Please enter your website domain.");
      return;
    }
    if (keywordRequired) {
      if (!keyword) {
        toast.error("Please enter an SMS keyword (e.g. BAKERY).");
        return;
      }
      if (!/^[A-Za-z0-9_]{1,50}$/.test(keyword)) {
        toast.error(
          "Keyword must be 1–50 characters, letters, numbers, or underscore only."
        );
        return;
      }
    }

    setWidgetSetupSaving(true);
    try {
      const res = await fetch(`/api/client/${widgetSetupSite.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          ...(keyword ? { keyword } : {}),
          ...(widgetSetupEnableAfter ? { pinned: true } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save site details");
      }

      const updated = data.data as Website | undefined;
      setWebsites((prev) =>
        prev.map((w) =>
          w.id === widgetSetupSite.id
            ? {
                ...w,
                domain: updated?.domain ?? domain,
                keyword: updated?.keyword ?? (keyword || w.keyword),
                pinned: widgetSetupEnableAfter ? true : w.pinned,
              }
            : w
        )
      );

      setWidgetSetupOpen(false);
      setWidgetSetupSite(null);
      toast.success(
        widgetSetupEnableAfter
          ? "Website saved. Widget is now live."
          : "Website saved. You can enable the widget when ready."
      );
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setWidgetSetupSaving(false);
    }
  };

  const openInstallationGuide = (website: Website) => {
    setInstallationGuideClientId(website.id);
    setInstallationGuideSiteName(website.name);
    setInstallationGuideOpen(true);
  };

  const pendingWidgetInstallSites = websites.filter(
    (w) =>
      w.installJob &&
      w.installJob.status !== "COMPLETED" &&
      w.installJob.status !== "CANCELLED"
  );
  const showWidgetActivationBanner =
    setupPath === SETUP_PATH_EMBED && pendingWidgetInstallSites.length > 0;
  const primaryPendingInstallSite = pendingWidgetInstallSites[0];

  const handleNewSiteClick = () => {
    router.push("/app/build");
  };

  const siteLimit = plan === "starter" ? 1 : plan === "pro" ? 3 : undefined;
  const canAddMoreSites = siteLimit === undefined || websites.length < siteLimit;

  const handleEditClick = (website: Website) => {
    setSelectedWebsite(website);
    setEditedName(website.name);
    setEditedDomain(isPlaceholderDomain(website.domain) ? "" : website.domain);
    setEditedKeyword(website.keyword ?? "");
    setEditedDefaultType(website.defaultType || "banner");
    setEditedDefaultBgColor(website.defaultBgColor || "#222");
    setEditedDefaultTextColor(website.defaultTextColor || "#fff");
    const savedFont = website.defaultFont || "sans-serif";
    setEditedDefaultFont(
      FONT_OPTIONS.some((f) => f.value === savedFont) ? savedFont : FONT_OPTIONS[0].value
    );
    const savedDismissAfter = website.defaultDismissAfter ?? 0;
    setEditedDefaultDismissAfter(savedDismissAfter > 0 ? savedDismissAfter : 5000);
    setUseDismissAfter(savedDismissAfter > 0);
    
    // Load widget configuration from JSON
    const widgetConfig = (website as any).widgetConfig || {};
    setLogoUrl(widgetConfig.logoUrl || "");
    setCompanyWebsiteLink(widgetConfig.companyWebsiteLink || "");
    setBackgroundImageUrl(widgetConfig.backgroundImageUrl || "");
    setBorderStyle(widgetConfig.borderStyle || "solid");
    setWidgetPosition(widgetConfig.widgetPosition || "top-right");
    setAnimationType(widgetConfig.animationType || "fade");
    setAnimationDuration(widgetConfig.animationDuration || 300);
    setFontSize(widgetConfig.fontSize || 14);
    setMobileFontSize(widgetConfig.mobileFontSize ?? "");
    setAttachImage(widgetConfig.attachImage || "");
    setPresetText(widgetConfig.presetText || "");
    setIframeWidth(widgetConfig.iframeWidth || "100%");
    setIframeHeight(widgetConfig.iframeHeight || "100vh");
    
    setConfigureDialogOpen(true);
  };

  const handleOpenAnnouncementSettings = (website: Website) => {
    setSelectedWebsite(website);
    setHostedSettingsOpen(true);
  };

  const handleCopyHostedUrl = (url: string) => {
    void navigator.clipboard.writeText(url);
    toast.success("Announcement page link copied");
  };

  const uploadWidgetImage = async (
    file: File,
    which: "logo" | "background" | "attach"
  ) => {
    if (!selectedWebsite?.id) {
      toast.error("Select a site first.");
      return;
    }
    const setBusy =
      which === "logo"
        ? setLogoUploading
        : which === "background"
          ? setBackgroundUploading
          : setAttachImageUploading;
    const setUrl =
      which === "logo"
        ? setLogoUrl
        : which === "background"
          ? setBackgroundImageUrl
          : setAttachImage;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/client/${selectedWebsite.id}/widget-upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      if (typeof data.url === "string") {
        setUrl(data.url);
        toast.success(
          which === "logo"
            ? "Logo uploaded"
            : which === "background"
              ? "Background image uploaded"
              : "Image uploaded"
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveClick = async (websiteId: string) => {
    if (isSaving) return; // Prevent multiple saves
    
    setIsSaving(true);
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Saving website configuration...");

      // Create widget configuration JSON
      const widgetConfig = {
        logoUrl,
        companyWebsiteLink,
        backgroundImageUrl,
        borderStyle,
        widgetPosition,
        animationType,
        animationDuration,
        fontSize,
        ...(mobileFontSize !== "" ? { mobileFontSize } : {}),
        attachImage,
        presetText,
        iframeWidth,
        iframeHeight,
      };

      const dismissAfterToSave = useDismissAfter
        ? Math.max(1, Number(editedDefaultDismissAfter) || 5000)
        : 0;

      const res = await fetch(`/api/client/${websiteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName,
          domain: editedDomain,
          keyword: editedKeyword.trim() ? editedKeyword.trim().toUpperCase() : undefined,
          defaultType: editedDefaultType,
          defaultBgColor: editedDefaultBgColor,
          defaultTextColor: editedDefaultTextColor,
          defaultFont: editedDefaultFont,
          defaultDismissAfter: dismissAfterToSave,
          widgetConfig,
        }),
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update website");
      }

      // Update local state
      setWebsites((prev) =>
        prev.map((site) =>
          site.id === websiteId
            ? {
                ...site,
                name: editedName,
                domain: editedDomain,
                keyword: editedKeyword.trim() ? editedKeyword.trim().toUpperCase() : null,
                defaultType: editedDefaultType,
                defaultBgColor: editedDefaultBgColor,
                defaultTextColor: editedDefaultTextColor,
                defaultFont: editedDefaultFont,
                defaultDismissAfter: dismissAfterToSave,
                widgetConfig: widgetConfig,
              }
            : site
        )
      );

      // Close dialog and show success
      setConfigureDialogOpen(false);
      setSelectedWebsite(null);
      toast.success("Website configuration saved successfully!", {
        description: "Your widget settings have been updated.",
        duration: 4000,
      });
      
      // Refresh router to ensure data consistency
      router.refresh();
    } catch (error: any) {
      console.error("Error updating website:", error);
      
      // Show error toast with more details
      toast.error("Failed to save configuration", {
        description: error.message || "An unexpected error occurred. Please try again.",
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => handleSaveClick(websiteId),
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    setConfigureDialogOpen(false);
    setSelectedWebsite(null);
  };

  const handleDeleteClick = async (websiteId: string) => {
    try {
      const res = await fetch(`/api/client/${websiteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete website");
      }

      setWebsites((prev) => prev.filter((site) => site.id !== websiteId));
      toast.success("Website deleted successfully!");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting website:", error);
      toast.error(error.message || "Failed to delete website.");
    }
  };

  const toggleClientIdVisibility = (websiteId: string) => {
    setShowClientId((prev) => ({
      ...prev,
      [websiteId]: !prev[websiteId],
    }));
  };

  const handleCopyClientId = (websiteId: string) => {
    navigator.clipboard.writeText(websiteId);
    toast.success("Client ID copied to clipboard!");
  };

  const handleOpenEmbedDialog = (websiteId: string) => {
    setSelectedWebsiteId(websiteId);
    setEmbedDialogOpen(true);
  };

  const handleOpenIframeDialog = (websiteId: string) => {
    setSelectedWebsiteId(websiteId);
    setIframeDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-2">
      <DotPattern
        className={cn(
          "-z-50",
          "[mask-image:radial-gradient(10000px_circle_at_center,white,transparent)]"
        )}
      />
      
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold">Registered Sites</h2>
        <div className="flex items-center gap-2">
          <a
            href="/configure_widget_settings.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="text-foreground">
              Widget Settings Guide
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
          {canAddMoreSites && (
            <Button onClick={handleNewSiteClick} className="text-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add New Site
            </Button>
          )}
        </div>
      </div>
      <PostByTextCallout plan={plan} className="mb-6 flex items-start gap-3 rounded-lg border border-amber-600/40 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-500/40 px-4 py-3" />

      {showWidgetActivationBanner && primaryPendingInstallSite && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-blue-600/30 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-500/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Wrench className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1 text-sm text-blue-950 dark:text-blue-100">
              <p className="font-semibold">Complete widget installation</p>
              <p>
                Add <strong>install@t2ms.biz</strong> to your website platform
                so our team can install the widget on{" "}
                <strong>{primaryPendingInstallSite.name}</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-blue-600/40"
              onClick={() => openInstallationGuide(primaryPendingInstallSite)}
            >
              View install instructions
            </Button>
            {primaryPendingInstallSite.installJob?.status === "QUEUED" &&
              primaryPendingInstallSite.installJob.platform === "To be confirmed" && (
                <Button
                  type="button"
                  size="sm"
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white"
                  onClick={() =>
                    router.push(
                      `/app/install-request?clientId=${primaryPendingInstallSite.id}`
                    )
                  }
                >
                  Submit install form
                </Button>
              )}
          </div>
        </div>
      )}

      {websites.length === 0 ? (
        <div className="text-muted-foreground">No websites registered yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <motion.div
              key={website.id}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
            >
              <Card className="bg-muted rounded-2xl overflow-hidden hover:bg-background flex flex-col h-full gap-0 py-0 shadow-sm">
                <CardHeader className="!grid-cols-none !grid-rows-none !flex flex-row items-center justify-between gap-2 space-y-0 px-3 py-2.5">
                  <CardTitle className="min-w-0 flex-1 text-base font-medium leading-tight break-words">
                    {website.name}
                  </CardTitle>
                  {editingWebsiteId !== website.id && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-7 w-7 shrink-0 p-0 rounded-full -mr-1"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[160px] p-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="justify-start w-full rounded-md hover:bg-secondary/50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the website.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteClick(website.id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </PopoverContent>
                    </Popover>
                  )}
                </CardHeader>

                <Separator />
                <CardContent className="px-3 py-2.5 flex-1 flex flex-col gap-2">
                  {(() => {
                    const hasInstallInProgress =
                      website.installJob &&
                      website.installJob.status !== "COMPLETED" &&
                      website.installJob.status !== "CANCELLED";
                    const widgetLive = Boolean(website.pinned) && !hasInstallInProgress;
                    let widgetStatusLabel = "Widget hidden";
                    if (hasInstallInProgress && website.installJob) {
                      widgetStatusLabel =
                        website.installJob.platform === "To be confirmed"
                          ? "Install form needed"
                          : "Install in progress";
                    } else if (website.pinned) {
                      widgetStatusLabel = "Widget live";
                    }
                    const hostedUrl =
                      website.hostedSlug?.trim()
                        ? `https://${website.hostedSlug}.${getHostedPageDomain()}`
                        : null;
                    const hostedDisplay =
                      website.hostedSlug?.trim()
                        ? `${website.hostedSlug}.${getHostedPageDomain()}`
                        : null;

                    return (
                      <>
                        {/* Widget channel */}
                        <div className="rounded-lg border border-border/80 bg-background/70 p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-semibold">Widget</span>
                              <span
                                className={`inline-flex max-w-full px-2 py-0.5 text-[11px] rounded-full font-medium whitespace-nowrap ${
                                  hasInstallInProgress
                                    ? "bg-amber-500/90 text-foreground"
                                    : widgetLive
                                      ? "bg-green-500 text-foreground"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {widgetStatusLabel}
                              </span>
                            </div>
                            <Switch
                              checked={website.pinned ?? false}
                              aria-label="Toggle website widget"
                              onCheckedChange={async (checked) => {
                                if (hasInstallInProgress) {
                                  toast.error(
                                    "Installation is still in progress. You can publish the widget once installation is completed."
                                  );
                                  return;
                                }

                                if (checked && !siteReadyForWidget(website, plan)) {
                                  const gaps = getWidgetSetupGaps(website, plan);
                                  toast.warning(
                                    gaps.needsDomain && gaps.needsKeyword
                                      ? "Add your website domain and SMS keyword before enabling the widget."
                                      : gaps.needsDomain
                                        ? "Add your website domain before enabling the widget."
                                        : "Add an SMS keyword before enabling the widget."
                                  );
                                  openWidgetSetup(website, true);
                                  return;
                                }

                                try {
                                  const res = await fetch(
                                    `/api/client/${website.id}`,
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({ pinned: checked }),
                                    }
                                  );

                                  if (!res.ok) {
                                    const errorData = await res.json();
                                    if (errorData.needsWidgetSetup) {
                                      openWidgetSetup(website, true);
                                      return;
                                    }
                                    throw new Error(
                                      errorData.error ||
                                        "Failed to update widget visibility"
                                    );
                                  }

                                  setWebsites((prev) =>
                                    prev.map((w) =>
                                      w.id === website.id
                                        ? { ...w, pinned: checked }
                                        : w
                                    )
                                  );

                                  toast.success(
                                    `Widget ${checked ? "live on your website" : "hidden"}`
                                  );
                                } catch (error: any) {
                                  console.error(
                                    "Error updating widget visibility:",
                                    error
                                  );
                                  toast.error(
                                    error.message ||
                                      "Failed to update widget visibility"
                                  );
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">
                            Embed on your own website domain.
                          </p>
                          <div className="text-sm space-y-0.5 leading-snug">
                            <p>
                              <span className="font-medium text-muted-foreground">
                                Domain:{" "}
                              </span>
                              {isPlaceholderDomain(website.domain) ? (
                                <span className="italic text-muted-foreground">
                                  Not set
                                </span>
                              ) : (
                                website.domain
                              )}
                            </p>
                            <p>
                              <span className="font-medium text-muted-foreground">
                                SMS:{" "}
                              </span>
                              {website.keyword ? (
                                <code className="text-xs bg-muted px-1 rounded">
                                  {website.keyword}: message
                                </code>
                              ) : (
                                <span className="italic text-muted-foreground">
                                  Keyword not set
                                </span>
                              )}
                            </p>
                          </div>
                          {!siteReadyForWidget(website, plan) && (
                            <div className="rounded-lg border border-amber-300/80 bg-amber-50 px-2.5 py-2 text-xs text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100">
                              <p className="font-medium">
                                {(() => {
                                  const gaps = getWidgetSetupGaps(website, plan);
                                  if (gaps.needsDomain && gaps.needsKeyword) {
                                    return "Domain & keyword needed for widget";
                                  }
                                  if (gaps.needsDomain) {
                                    return "Website domain needed for widget";
                                  }
                                  return "SMS keyword needed for multi-site widget";
                                })()}
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                className="mt-1.5 h-7 !bg-amber-600 hover:!bg-amber-700 !text-white"
                                onClick={() => openWidgetSetup(website, false)}
                              >
                                {(() => {
                                  const gaps = getWidgetSetupGaps(website, plan);
                                  if (gaps.needsDomain && gaps.needsKeyword) {
                                    return "Add website & keyword";
                                  }
                                  if (gaps.needsDomain) {
                                    return "Add website domain";
                                  }
                                  return "Add SMS keyword";
                                })()}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Announcement page channel */}
                        <div className="rounded-lg border border-amber-600/25 bg-amber-50/40 dark:bg-amber-950/20 p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-semibold">
                                Announcement page
                              </span>
                              <span
                                className={`inline-flex max-w-full px-2 py-0.5 text-[11px] rounded-full font-medium whitespace-nowrap ${
                                  website.hostedEnabled
                                    ? "bg-green-500/90 text-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {website.hostedEnabled
                                  ? "Live"
                                  : website.hostedSlug
                                    ? "Off"
                                    : "Not set up"}
                              </span>
                            </div>
                            <Switch
                              checked={Boolean(website.hostedEnabled)}
                              aria-label="Toggle announcement page"
                              onCheckedChange={async (checked) => {
                                if (checked && !website.hostedSlug?.trim()) {
                                  toast.warning(
                                    "Choose a page URL name before publishing."
                                  );
                                  handleOpenAnnouncementSettings(website);
                                  return;
                                }

                                try {
                                  const res = await fetch(
                                    `/api/client/${website.id}/hosted`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        hostedEnabled: checked,
                                      }),
                                    }
                                  );
                                  const data = await res.json();
                                  if (!res.ok) {
                                    throw new Error(
                                      data.error ||
                                        "Failed to update announcement page"
                                    );
                                  }

                                  setWebsites((prev) =>
                                    prev.map((w) =>
                                      w.id === website.id
                                        ? {
                                            ...w,
                                            hostedEnabled: checked,
                                            hostedSlug:
                                              data.data?.hostedSlug ??
                                              w.hostedSlug,
                                          }
                                        : w
                                    )
                                  );

                                  toast.success(
                                    checked
                                      ? "Announcement page is live"
                                      : "Announcement page turned off"
                                  );
                                } catch (error: any) {
                                  console.error(
                                    "Error updating hosted page visibility:",
                                    error
                                  );
                                  toast.error(
                                    error.message ||
                                      "Failed to update announcement page"
                                  );
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">
                            Public shareable page — no website install needed.
                          </p>

                          {hostedUrl && hostedDisplay ? (
                            <div className="rounded-md border border-amber-600/30 bg-background px-2.5 py-2 space-y-1.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                                Your announcement link
                              </p>
                              <a
                                href={hostedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm font-semibold text-amber-800 dark:text-amber-200 hover:underline break-all leading-snug"
                              >
                                {hostedDisplay}
                              </a>
                              <div className="flex flex-wrap gap-1.5">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7"
                                  onClick={() => handleCopyHostedUrl(hostedUrl)}
                                >
                                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                                  Copy link
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7"
                                  asChild
                                >
                                  <a
                                    href={hostedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                    Open
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-md border border-dashed border-amber-600/40 bg-background/60 px-2.5 py-2 text-xs text-muted-foreground leading-snug">
                              No public URL yet. Set a page name in announcement
                              settings to get your{" "}
                              <span className="font-mono">
                                name.{getHostedPageDomain()}
                              </span>{" "}
                              link.
                            </div>
                          )}
                        </div>

                        {/* Shared details */}
                        <div className="space-y-1.5 text-sm pt-0">
                          {website.installJob && (
                            <p className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">Install:</span>
                              <Badge
                                variant={
                                  website.installJob.status === "COMPLETED"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  website.installJob.status === "PENDING_PAYMENT"
                                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                    : website.installJob.status === "QUEUED" ||
                                        website.installJob.status ===
                                          "IN_PROGRESS"
                                      ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                                      : ""
                                }
                              >
                                {website.installJob.status === "QUEUED"
                                  ? website.installJob.platform ===
                                    "To be confirmed"
                                    ? "Install form not submitted"
                                    : "Installation In Progress"
                                  : website.installJob.status.replace(
                                      /_/g,
                                      " "
                                    )}
                              </Badge>
                              {website.installJob.status === "QUEUED" &&
                                website.installJob.platform ===
                                  "To be confirmed" && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-primary"
                                    onClick={() =>
                                      router.push(
                                        `/app/install-request?clientId=${website.id}`
                                      )
                                    }
                                  >
                                    Submit install form
                                  </Button>
                                )}
                              {website.installJob.status ===
                                "PENDING_PAYMENT" && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-primary"
                                  onClick={() =>
                                    router.push(
                                      `/app/install-request?jobId=${website.installJob!.id}`
                                    )
                                  }
                                >
                                  Complete payment
                                </Button>
                              )}
                            </p>
                          )}
                          <div>
                            <span className="font-semibold">Phone:</span>
                            {website.phoneNumbers &&
                            website.phoneNumbers.length > 0 ? (
                              <div className="mt-1 space-y-1">
                                {website.phoneNumbers.map((phone) => (
                                  <div
                                    key={phone.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <span>{phone.phone}</span>
                                    {phone.verified ? (
                                      <Badge
                                        variant="default"
                                        className="bg-green-500 text-xs"
                                      >
                                        Verified
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Unverified
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm ml-1">
                                None
                              </span>
                            )}
                          </div>
                          <p className="flex items-center gap-1.5 flex-wrap text-xs">
                            <span className="font-semibold text-sm">
                              Client ID
                            </span>
                            <span className="text-muted-foreground">
                              (widget embed)
                            </span>
                            <span className="font-mono">
                              {showClientId[website.id]
                                ? website.id
                                : `${website.id.slice(0, 6)}...`}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                toggleClientIdVisibility(website.id)
                              }
                            >
                              {showClientId[website.id] ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyClientId(website.id)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5 mt-auto">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-9 rounded-full border-border bg-background hover:bg-muted text-sm"
                            onClick={() => handleEditClick(website)}
                          >
                            Widget settings
                          </Button>
                          <Button
                            type="button"
                            className="w-full h-9 rounded-full !bg-amber-600 hover:!bg-amber-700 !text-white text-sm"
                            onClick={() =>
                              handleOpenAnnouncementSettings(website)
                            }
                          >
                            Announcement page
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reusable Embed Dialog */}
      <EmbedDialog
        open={embedDialogOpen}
        onOpenChange={setEmbedDialogOpen}
        clientId={selectedWebsiteId}
      />

      {/* iFrame Embed Dialog */}
      <IframeDialog
        open={iframeDialogOpen}
        onOpenChange={setIframeDialogOpen}
        clientId={selectedWebsiteId}
        widgetConfig={selectedWebsiteId ? websites.find(w => w.id === selectedWebsiteId)?.widgetConfig : undefined}
      />

      {/* Installation Guide Dialog */}
      <InstallationGuideDialog
        open={installationGuideOpen}
        onOpenChange={setInstallationGuideOpen}
        clientId={installationGuideClientId}
        siteName={installationGuideSiteName || undefined}
      />

      {/* Add website domain + SMS keyword before enabling widget */}
      <Dialog
        open={widgetSetupOpen}
        onOpenChange={(open) => {
          setWidgetSetupOpen(open);
          if (!open) {
            setWidgetSetupSite(null);
            setWidgetSetupEnableAfter(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {planRequiresSmsKeyword(plan)
                ? "Add website & SMS keyword"
                : "Add website domain"}
            </DialogTitle>
            <DialogDescription>
              {widgetSetupEnableAfter
                ? planRequiresSmsKeyword(plan)
                  ? "The widget needs your website domain and an SMS keyword before it can go live."
                  : "The widget needs your website domain before it can go live."
                : planRequiresSmsKeyword(plan)
                  ? "Add your website domain and SMS keyword so you can enable the widget on your site."
                  : "Add your website domain so you can enable the widget on your site."}
              {widgetSetupSite?.name ? (
                <span className="mt-1 block text-foreground">
                  Site: <strong>{widgetSetupSite.name}</strong>
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="widget-setup-domain">Website domain *</Label>
              <Input
                id="widget-setup-domain"
                placeholder="https://example.com"
                value={widgetSetupDomain}
                onChange={(e) => setWidgetSetupDomain(e.target.value)}
                disabled={widgetSetupSaving}
              />
            </div>
            {planRequiresSmsKeyword(plan) && (
              <div className="space-y-2">
                <Label htmlFor="widget-setup-keyword">SMS keyword *</Label>
                <Input
                  id="widget-setup-keyword"
                  placeholder="BAKERY"
                  value={widgetSetupKeyword}
                  onChange={(e) =>
                    setWidgetSetupKeyword(
                      e.target.value.replace(/\s/g, "").toUpperCase()
                    )
                  }
                  disabled={widgetSetupSaving}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Required for multi-site routing. To post via text:{" "}
                  <strong>
                    {widgetSetupKeyword || "KEYWORD"}: your message
                  </strong>
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={widgetSetupSaving}
              onClick={() => setWidgetSetupOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="!bg-amber-600 hover:!bg-amber-700 !text-white"
              disabled={widgetSetupSaving}
              onClick={handleWidgetSetupSave}
            >
              {widgetSetupSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : widgetSetupEnableAfter ? (
                "Save & enable widget"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Widget settings sheet */}
      <Sheet  open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
        <SheetContent className="w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] 2xl:w-[45vw] overflow-y-auto pl-5 pr-5">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-xl sm:text-2xl">Widget settings</SheetTitle>
            <SheetDescription className="text-sm sm:text-base">
              Domain, SMS keyword, embed, and widget styling for{" "}
              {selectedWebsite?.name ?? "this site"}.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6">
            <div>
              <Label className="mb-2 text-sm font-medium">Business Name</Label>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Label className="mb-2 text-sm font-medium">Domain</Label>
              <Input
                value={editedDomain}
                onChange={(e) => setEditedDomain(e.target.value)}
                placeholder="https://example.com"
                className="w-full"
              />
              {selectedWebsite && isPlaceholderDomain(selectedWebsite.domain) && !editedDomain.trim() && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  Required to enable the website widget.
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">
                SMS Keyword
                {planRequiresSmsKeyword(plan) ? "" : " (optional)"}
              </Label>
              <Input
                value={editedKeyword}
                onChange={(e) =>
                  setEditedKeyword(e.target.value.replace(/\s/g, "").toUpperCase())
                }
                placeholder={
                  planRequiresSmsKeyword(plan) ? "e.g. BAKERY" : "Optional"
                }
                className="w-full"
                maxLength={50}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {planRequiresSmsKeyword(plan)
                  ? "Required for multi-site routing. "
                  : "Optional on single-site plans. "}
                To post via text to{" "}
                <strong>{getT2msSmsDisplayNumber()}</strong>, send:{" "}
                <strong>{editedKeyword || "KEYWORD"}: your message</strong>
                {planRequiresSmsKeyword(plan) && !editedKeyword.trim() && (
                  <span className="block mt-1 text-amber-700 dark:text-amber-400">
                    Required to enable the website widget.
                  </span>
                )}
              </p>
            </div>
            
            {/* Phone Numbers Section - Managed separately */}
            {selectedWebsite && (
              <PhoneNumberManagement clientId={selectedWebsite.id} />
            )}
            
            <Separator />
            
            {/* Widget Configuration Section */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 text-sm font-medium">Widget Type</Label>
                <Select
                  onValueChange={setEditedDefaultType}
                  defaultValue={editedDefaultType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">
                      <div className="flex flex-col">
                        <span className="font-medium">Banner</span>
                        <span className="text-xs text-muted-foreground">Horizontal banner for announcements</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="popup">
                      <div className="flex flex-col">
                        <span className="font-medium">Popup</span>
                        <span className="text-xs text-muted-foreground">Small corner notification</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fullscreen">
                      <div className="flex flex-col">
                        <span className="font-medium">Fullscreen</span>
                        <span className="text-xs text-muted-foreground">Covers entire screen</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="modal">
                      <div className="flex flex-col">
                        <span className="font-medium">Modal</span>
                        <span className="text-xs text-muted-foreground">Centered dialog box</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ticker">
                      <div className="flex flex-col">
                        <span className="font-medium">Ticker</span>
                        <span className="text-xs text-muted-foreground">Scrolling text banner</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Widget Type Instructions */}
                <div className="mt-3 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">
                        {editedDefaultType.charAt(0).toUpperCase() + editedDefaultType.slice(1)} Widget
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {widgetTypeInstructions[editedDefaultType as keyof typeof widgetTypeInstructions]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attach Image - Only for Fullscreen Widget */}
            {editedDefaultType === "fullscreen" && (
              <div>
                <Label className="mb-2 text-sm font-medium">Attach Image</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload an image (JPEG, PNG, WebP, or GIF, max 5MB) or paste an image URL. Shown
                  alongside your message in the fullscreen widget.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    id="widget-attach-image-upload"
                    disabled={!selectedWebsite || attachImageUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) void uploadWidgetImage(file, "attach");
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full shrink-0 sm:w-auto"
                    disabled={!selectedWebsite || attachImageUploading}
                    onClick={() =>
                      document.getElementById("widget-attach-image-upload")?.click()
                    }
                  >
                    {attachImageUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Upload image"
                    )}
                  </Button>
                  <Input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={attachImage}
                    onChange={(e) => setAttachImage(e.target.value)}
                    className="w-full flex-1"
                  />
                </div>
                {attachImage ? (
                  <div className="mt-2 rounded-md border bg-muted/30 p-2">
                    <p className="mb-1 text-xs text-muted-foreground">Preview</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attachImage}
                      alt="Fullscreen attach preview"
                      className="max-h-40 max-w-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Preset Text - Only for Fullscreen Widget */}
            {editedDefaultType === "fullscreen" && (
              <div>
                <Label className="mb-2 text-sm font-medium">Preset Text</Label>
                <Input
                  placeholder="Enter preset text to display above the message"
                  value={presetText}
                  onChange={(e) => setPresetText(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add preset text that will appear above your message in the fullscreen widget.
                </p>
              </div>
            )}
            
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <Label className="text-sm font-medium">Font Family</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setFontStylesDialogOpen(true)}
                >
                  View font styles
                </Button>
              </div>
              <select
                value={FONT_OPTIONS.some((f) => f.value === editedDefaultFont) ? editedDefaultFont : FONT_OPTIONS[0].value}
                onChange={(e) => setEditedDefaultFont(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* T2MS Font Styles pop-up */}
            <Dialog open={fontStylesDialogOpen} onOpenChange={setFontStylesDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-lg">T2MS Font Styles</DialogTitle>
                  <DialogDescription>
                    Preview how each font will look in your widget.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-auto rounded-xl border-2 border-amber-800/40 bg-background p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border-2 border-amber-800/40 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800/80">Name of Font</p>
                      <div className="flex flex-col gap-2 text-sm">
                        {FONT_OPTIONS.map((font) => (
                          <div key={font.value} className="py-1">
                            {font.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border-2 border-amber-800/40 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800/80">Font Display</p>
                      <div className="flex flex-col gap-2 text-sm">
                        {FONT_OPTIONS.map((font) => (
                          <div
                            key={font.value}
                            className="py-1"
                            style={{ fontFamily: font.value }}
                          >
                            {font.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <div>
              <Label className="mb-2 text-sm font-medium">Font Size (px)</Label>
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                placeholder="14"
                min="8"
                max="48"
                className="w-full"
              />
              <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Font Size Guide:</strong>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Small: 8-12px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium: 13-16px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Large: 17-24px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extra Large: 25-48px</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Mobile Font Size (px)</Label>
              <Input
                type="number"
                value={mobileFontSize}
                onChange={(e) =>
                  setMobileFontSize(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Optional - defaults to desktop size"
                min="8"
                max="48"
                className="w-full"
              />
              <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                <p className="text-xs text-muted-foreground">
                  Optional mobile-only override for banner and other widget text.
                  Leave blank to use the regular font size on phones.
                </p>
              </div>
            </div>
            
            {/* Dismiss After - Only for Banner and Popup Widgets */}
            {(editedDefaultType === "banner" || editedDefaultType === "popup") && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Checkbox
                    id="enable-dismiss-after"
                    checked={useDismissAfter}
                    onCheckedChange={(checked) => {
                      const enabled = checked === true;
                      setUseDismissAfter(enabled);
                      if (enabled && (!editedDefaultDismissAfter || editedDefaultDismissAfter <= 0)) {
                        setEditedDefaultDismissAfter(5000);
                      }
                    }}
                  />
                  <Label htmlFor="enable-dismiss-after" className="text-sm font-medium">
                    Enable auto dismiss
                  </Label>
                </div>
                <Label className="mb-2 text-sm font-medium">Dismiss After (ms)</Label>
                <Input
                  type="number"
                  value={editedDefaultDismissAfter}
                  onChange={(e) => setEditedDefaultDismissAfter(Number(e.target.value))}
                  placeholder="5000"
                  className="w-full"
                  disabled={!useDismissAfter}
                  min={1}
                />
                <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Dismiss Timer:</strong> The time in milliseconds that takes the popup and banner widgets to disappear automatically. 
                    <br />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      • 1000ms = 1 second • 5000ms = 5 seconds • 10000ms = 10 seconds
                    </span>
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <Label className="mb-2 text-sm font-medium">Background Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={editedDefaultBgColor}
                  onChange={(e) => setEditedDefaultBgColor(e.target.value)}
                  className="h-12 w-16 p-1 rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
                />
                <Input
                  value={editedDefaultBgColor}
                  onChange={(e) => setEditedDefaultBgColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#222222"
                />
              </div>
            </div>
            
            <div>
              <Label className="mb-2 text-sm font-medium">Text Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={editedDefaultTextColor}
                  onChange={(e) => setEditedDefaultTextColor(e.target.value)}
                  className="h-12 w-16 p-1 rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
                />
                <Input
                  value={editedDefaultTextColor}
                  onChange={(e) => setEditedDefaultTextColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Logo and Branding — website widget only */}
            <div>
              <Label className="mb-2 text-sm font-medium">Widget logo</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Used on the website widget only — not the announcement page.
                Upload JPEG, PNG, WebP, or GIF (max 5MB) or paste a URL.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  id="widget-logo-upload"
                  disabled={!selectedWebsite || logoUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void uploadWidgetImage(file, "logo");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full shrink-0 sm:w-auto"
                  disabled={!selectedWebsite || logoUploading}
                  onClick={() => document.getElementById("widget-logo-upload")?.click()}
                >
                  {logoUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Upload image"
                  )}
                </Button>
                <Input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full flex-1"
                />
              </div>
              {logoUrl ? (
                <div className="mt-2 rounded-md border bg-muted/30 p-2">
                  <p className="mb-1 text-xs text-muted-foreground">Preview</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="max-h-16 max-w-full object-contain"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Attach Link</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={companyWebsiteLink}
                onChange={(e) => setCompanyWebsiteLink(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Widget background image</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Website widget only — not the announcement page. Upload an image
                or paste a URL.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  id="widget-bg-upload"
                  disabled={!selectedWebsite || backgroundUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void uploadWidgetImage(file, "background");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full shrink-0 sm:w-auto"
                  disabled={!selectedWebsite || backgroundUploading}
                  onClick={() => document.getElementById("widget-bg-upload")?.click()}
                >
                  {backgroundUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Upload image"
                  )}
                </Button>
                <Input
                  type="text"
                  placeholder="https://example.com/background.jpg"
                  value={backgroundImageUrl}
                  onChange={(e) => setBackgroundImageUrl(e.target.value)}
                  className="w-full flex-1"
                />
              </div>
              {backgroundImageUrl ? (
                <div className="mt-2 h-20 w-full overflow-hidden rounded-md border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={backgroundImageUrl}
                    alt="Background preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            {/* Border Style */}
            <div>
              <Label className="mb-2 text-sm font-medium">Border Style</Label>
              <Select value={borderStyle} onValueChange={setBorderStyle}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Widget Position - Only for Popup */}
            {editedDefaultType === "popup" && (
              <div>
                <Label className="mb-2 text-sm font-medium">Widget Position</Label>
                <Select value={widgetPosition} onValueChange={setWidgetPosition}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-center">Top Center</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="center-left">Center Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="center-right">Center Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-center">Bottom Center</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="mb-2 text-sm font-medium">Animation Type</Label>
              <Select value={animationType} onValueChange={setAnimationType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fade">Fade In/Out</SelectItem>
                  <SelectItem value="slide-up">Slide Up</SelectItem>
                  <SelectItem value="slide-down">Slide Down</SelectItem>
                  <SelectItem value="slide-left">Slide Left</SelectItem>
                  <SelectItem value="slide-right">Slide Right</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Animation Speed</Label>
              <Select value={animationDuration.toString()} onValueChange={(value) => setAnimationDuration(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Very Fast (0.1s)</SelectItem>
                  <SelectItem value="300">Fast (0.3s)</SelectItem>
                  <SelectItem value="500">Medium (0.5s)</SelectItem>
                  <SelectItem value="800">Slow (0.8s)</SelectItem>
                  <SelectItem value="1200">Very Slow (1.2s)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* iFrame Configuration */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 text-sm font-medium">iFrame Width</Label>
                <Input
                  value={iframeWidth}
                  onChange={(e) => setIframeWidth(e.target.value)}
                  placeholder="100%"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set the width of the iframe. Examples: "100%", "500px", "50vw"
                </p>
              </div>

              <div>
                <Label className="mb-2 text-sm font-medium">iFrame Height</Label>
                <Input
                  value={iframeHeight}
                  onChange={(e) => setIframeHeight(e.target.value)}
                  placeholder="100vh"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set the height of the iframe. Examples: "100vh", "600px", "50vh"
                </p>
              </div>
            </div>

            {/* SMS Disclaimer */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-amber-200">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Important:</strong> By enabling SMS updates, you agree to our Terms and Acceptable Use. 
                Reply HELP for help, STOP to opt out. Msg & data rates may apply.
              </p>
            </div>

          </div>
          
          <SheetFooter className="pt-6 border-t">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                onClick={handleCancelClick} 
                variant="outline" 
                className="w-full sm:w-auto"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => selectedWebsite && handleSaveClick(selectedWebsite.id)}
                disabled={!selectedWebsite || isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Announcement page settings sheet */}
      <Sheet
        open={hostedSettingsOpen}
        onOpenChange={(open) => {
          setHostedSettingsOpen(open);
          if (!open) {
            // keep selectedWebsite so other dialogs still work if opened next
          }
        }}
      >
        <SheetContent className="w-[90vw] sm:w-[480px] md:w-[520px] overflow-y-auto pl-5 pr-5">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl sm:text-2xl">
              Announcement page
            </SheetTitle>
            <SheetDescription className="text-sm sm:text-base">
              Public shareable page for{" "}
              <strong>{selectedWebsite?.name ?? "this site"}</strong> — no
              website install required.
            </SheetDescription>
          </SheetHeader>
          {selectedWebsite && (
            <HostedPageSettings
              clientId={selectedWebsite.id}
              siteName={selectedWebsite.name}
              onSaved={({ hostedSlug, hostedEnabled }) => {
                setWebsites((prev) =>
                  prev.map((w) =>
                    w.id === selectedWebsite.id
                      ? { ...w, hostedSlug, hostedEnabled }
                      : w
                  )
                );
                setSelectedWebsite((prev) =>
                  prev && prev.id === selectedWebsite.id
                    ? { ...prev, hostedSlug, hostedEnabled }
                    : prev
                );
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}