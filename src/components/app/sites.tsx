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
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
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
import { Info } from "lucide-react";
import { PhoneNumberManagement } from "./phone-number-management";
import { Badge } from "@/components/ui/badge";

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

  // Widget configuration state
  const [logoUrl, setLogoUrl] = useState("");
  const [companyWebsiteLink, setCompanyWebsiteLink] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [widgetPosition, setWidgetPosition] = useState("top-right");
  const [animationType, setAnimationType] = useState("fade");
  const [animationDuration, setAnimationDuration] = useState(300);
  const [fontSize, setFontSize] = useState(14);
  const [attachImage, setAttachImage] = useState("");
  const [presetText, setPresetText] = useState("");
  const [iframeWidth, setIframeWidth] = useState("100%");
  const [iframeHeight, setIframeHeight] = useState("100vh");

  const [showClientId, setShowClientId] = useState<Record<string, boolean>>({});
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [iframeDialogOpen, setIframeDialogOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [installationGuideOpen, setInstallationGuideOpen] = useState(false);
  const [installationGuideClientId, setInstallationGuideClientId] = useState<string | null>(null);
  const [installationGuideSiteName, setInstallationGuideSiteName] = useState<string>("");
  const [fontStylesDialogOpen, setFontStylesDialogOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    if (!userId) return;
    fetch("/api/plan/usage")
      .then((r) => r.json())
      .then((data) => setPlan(data?.plan ?? "free"))
      .catch(() => setPlan("free"));
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
      toast.success("Site Registered Successfully");
      window.history.replaceState({}, "", "/app/sites");
    }
  }, [searchParams]);

  const handleNewSiteClick = () => {
    router.push("/app/build");
  };

  const siteLimit = plan === "starter" ? 1 : plan === "pro" ? 3 : undefined;
  const canAddMoreSites = siteLimit === undefined || websites.length < siteLimit;

  const handleEditClick = (website: Website) => {
    setSelectedWebsite(website);
    setEditedName(website.name);
    setEditedDomain(website.domain);
    setEditedKeyword(website.keyword ?? "");
    setEditedDefaultType(website.defaultType || "banner");
    setEditedDefaultBgColor(website.defaultBgColor || "#222");
    setEditedDefaultTextColor(website.defaultTextColor || "#fff");
    const savedFont = website.defaultFont || "sans-serif";
    setEditedDefaultFont(
      FONT_OPTIONS.some((f) => f.value === savedFont) ? savedFont : FONT_OPTIONS[0].value
    );
    setEditedDefaultDismissAfter(website.defaultDismissAfter ?? 5000);
    
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
    setAttachImage(widgetConfig.attachImage || "");
    setPresetText(widgetConfig.presetText || "");
    setIframeWidth(widgetConfig.iframeWidth || "100%");
    setIframeHeight(widgetConfig.iframeHeight || "100vh");
    
    setConfigureDialogOpen(true);
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
        attachImage,
        presetText,
        iframeWidth,
        iframeHeight,
      };

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
          defaultDismissAfter: editedDefaultDismissAfter,
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
                defaultDismissAfter: editedDefaultDismissAfter,
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
        {canAddMoreSites && (
          <Button onClick={handleNewSiteClick} className="text-foreground">
            <Plus className="mr-2 h-4 w-4" /> Add New Site
          </Button>
        )}
      </div>
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-600/40 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-500/40 px-4 py-3">
        <MessageCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
          {plan === "starter"
            ? "Text 1 (424) 484-8267 from your verified number. Just send your message to post to your site."
            : "Text 1 (424) 484-8267 from your verified number. Use KEYWORD: your message (e.g. BAKERY: Fresh croissants today) to post to the right site."}
        </p>
      </div>

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
              <Card className="bg-muted rounded-2xl overflow-hidden hover:bg-background">
                <CardHeader className="flex items-center justify-between px-4 py-0">
  <div className="flex items-center space-x-3">
    <CardTitle className="text-lg font-medium">{website.name}</CardTitle>

    {/* Published switch with badge */}
    <div className="flex items-center space-x-2">
      <Switch
        checked={website.pinned ?? false}
        onCheckedChange={async (checked) => {
          const hasInstallInProgress =
            website.installJob &&
            website.installJob.status !== "COMPLETED" &&
            website.installJob.status !== "CANCELLED";

          // Customers cannot publish/unpublish until installation is complete
          if (hasInstallInProgress) {
            toast.error(
              "Installation is still in progress. You can publish this site once installation is completed."
            );
            return;
          }

          try {
            const res = await fetch(`/api/client/${website.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pinned: checked }),
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Failed to update published state");
            }

            // Update state locally
            setWebsites((prev) =>
              prev.map((w) =>
                w.id === website.id ? { ...w, pinned: checked } : w
              )
            );

            toast.success(`Site ${checked ? "published" : "unpublished"}`);
          } catch (error: any) {
            console.error("Error updating published state:", error);
            toast.error(error.message || "Failed to update published state");
          }
        }}
      />
      {(() => {
        const hasInstallInProgress =
          website.installJob &&
          website.installJob.status !== "COMPLETED" &&
          website.installJob.status !== "CANCELLED";

        const badgeClasses = hasInstallInProgress
          ? "bg-amber-500/90 text-foreground"
          : website.pinned
          ? "bg-green-500 text-foreground"
          : "bg-muted text-foreground";

        let label: string;
        if (hasInstallInProgress && website.installJob) {
          label =
            website.installJob.platform === "To be confirmed"
              ? "Install form not submitted"
              : "Installation In Progress: 80%";
        } else {
          label = website.pinned ? "Published" : "Unpublished";
        }

        return (
          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${badgeClasses}`}>
            {label}
          </span>
        );
      })()}
    </div>
  </div>

  {editingWebsiteId !== website.id && (
    <div className="flex items-center space-x-2">
      {/* More menu */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full"
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
    </div>
  )}
</CardHeader>


                <Separator />
                <CardContent className="px-4 py-1">
  <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm">
          <span className="font-semibold">Domain:</span> {website.domain}
        </p>
        {website.keyword && (
          <p className="text-sm">
            <span className="font-semibold">SMS:</span> <code className="text-xs bg-muted px-1 rounded">{website.keyword}: message</code>
          </p>
        )}
      </div>
      {website.installJob && (
        <p className="flex items-center gap-2">
          <span className="font-semibold">Install request:</span>
          <Badge
            variant={website.installJob.status === "COMPLETED" ? "default" : "secondary"}
            className={
              website.installJob.status === "PENDING_PAYMENT"
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                : website.installJob.status === "QUEUED" || website.installJob.status === "IN_PROGRESS"
                  ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  : ""
            }
          >
            {website.installJob.status === "QUEUED"
              ? website.installJob.platform === "To be confirmed"
                ? "Install form not submitted"
                : "Installation In Progress"
              : website.installJob.status.replace(/_/g, " ")}
          </Badge>
          {website.installJob.status === "QUEUED" &&
            website.installJob.platform === "To be confirmed" && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary"
                onClick={() => router.push(`/app/install-request?clientId=${website.id}`)}
              >
                Submit install form
              </Button>
            )}
          {website.installJob.status === "PENDING_PAYMENT" && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary"
              onClick={() => router.push(`/app/install-request?jobId=${website.installJob!.id}`)}
            >
              Complete payment
            </Button>
          )}
        </p>
      )}
      <div>
        <span className="font-semibold">Phone Numbers:</span>
        {website.phoneNumbers && website.phoneNumbers.length > 0 ? (
          <div className="mt-1 space-y-1">
            {website.phoneNumbers.map((phone) => (
              <div key={phone.id} className="flex items-center gap-2 text-sm">
                <span>{phone.phone}</span>
                {phone.verified ? (
                  <Badge variant="default" className="bg-green-500 text-xs">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Unverified
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm ml-2">No phone numbers</span>
        )}
      </div>
      <p className="flex items-center space-x-2">
        <span className="font-semibold">Client ID:</span>
        <span className="font-mono text-sm">
          {showClientId[website.id] ? website.id : `${website.id.slice(0, 6)}...`}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleClientIdVisibility(website.id)}
        >
          {showClientId[website.id] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleCopyClientId(website.id)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </p>

      {/* Configure button */}
      <div className="pt-2">
        <Button
          variant="outline"
          className="w-full bg-primary rounded-full hover:bg-primary/80 text-foreground"
          onClick={() => handleEditClick(website)}
        >
          Configure Settings
        </Button>
      </div>

    </div>
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

      {/* Configure Sheet */}
      <Sheet  open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
        <SheetContent className="w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] 2xl:w-[45vw] overflow-y-auto pl-5 pr-5">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-xl sm:text-2xl">Configure Widget Settings</SheetTitle>
            <SheetDescription className="text-sm sm:text-base">
              Update your website settings and widget preferences.
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
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">SMS Keyword</Label>
              <Input
                value={editedKeyword}
                onChange={(e) => setEditedKeyword(e.target.value.replace(/\s/g, "").toUpperCase())}
                placeholder="e.g. BAKERY"
                className="w-full"
                maxLength={50}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                To post via text: <strong>{editedKeyword || "KEYWORD"}: your message</strong>
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
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={attachImage}
                  onChange={(e) => setAttachImage(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add an image to display in the fullscreen widget. This will be shown alongside your message.
                </p>
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
            
            {/* Dismiss After - Only for Banner and Popup Widgets */}
            {(editedDefaultType === "banner" || editedDefaultType === "popup") && (
              <div>
                <Label className="mb-2 text-sm font-medium">Dismiss After (ms)</Label>
                <Input
                  type="number"
                  value={editedDefaultDismissAfter}
                  onChange={(e) => setEditedDefaultDismissAfter(Number(e.target.value))}
                  placeholder="5000"
                  className="w-full"
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

            {/* Logo and Branding */}
            <div>
              <Label className="mb-2 text-sm font-medium">Attach Logo</Label>
              <Input
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full"
              />
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
              <Label className="mb-2 text-sm font-medium">Widget Background Image</Label>
              <Input
                type="url"
                placeholder="https://example.com/background.jpg"
                value={backgroundImageUrl}
                onChange={(e) => setBackgroundImageUrl(e.target.value)}
                className="w-full"
              />
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
    </div>
  );
}