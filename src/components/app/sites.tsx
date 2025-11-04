// app/dashboard/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Target,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, Variants } from "framer-motion";
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

// Match the Prisma Client model exactly
interface Website {
  pinned: boolean;
  id: string;
  name: string;
  domain: string;
  organizationId?: string;
  phoneNumbers?: Array<{
    id: string;
    phone: string;
    verified: boolean;
  }>;
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
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWebsiteId, setEditingWebsiteId] = useState<string | null>(null);

  // Editable fields
  const [editedName, setEditedName] = useState("");
  const [editedDomain, setEditedDomain] = useState("");
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

  const [showClientId, setShowClientId] = useState<Record<string, boolean>>({});
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchWebsites = async () => {
      setLoading(true);
      // API now returns organization's clients (no userId param needed)
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

  const handleNewSiteClick = () => {
    router.push("/app/build");
  };

  const handleEditClick = (website: Website) => {
    setSelectedWebsite(website);
    setEditedName(website.name);
    setEditedDomain(website.domain);
    setEditedDefaultType(website.defaultType || "banner");
    setEditedDefaultBgColor(website.defaultBgColor || "#222");
    setEditedDefaultTextColor(website.defaultTextColor || "#fff");
    setEditedDefaultFont(website.defaultFont || "sans-serif");
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
      };

      const res = await fetch(`/api/client/${websiteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName,
          domain: editedDomain,
          // Phone removed - handled separately via phone management APIs
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

  return (
    <div className="container mx-auto py-2">
      <DotPattern
        className={cn(
          "-z-50",
          "[mask-image:radial-gradient(10000px_circle_at_center,white,transparent)]"
        )}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Registered Sites</h2>
        <Button onClick={handleNewSiteClick} className="text-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add New Site
        </Button>
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
    
    {/* Pinned switch with badge */}
    <div className="flex items-center space-x-2">
      <Switch
        checked={website.pinned ?? false}
        onCheckedChange={async (checked) => {
          try {
            const res = await fetch(`/api/client/${website.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pinned: checked }),
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Failed to update pinned state");
            }

            // Update state locally
            setWebsites((prev) =>
              prev.map((w) =>
                w.id === website.id ? { ...w, pinned: checked } : w
              )
            );

            toast.success(`Pinned state updated: ${checked ? "ON" : "OFF"}`);
          } catch (error: any) {
            console.error("Error updating pinned state:", error);
            toast.error(error.message || "Failed to update pinned state");
          }
        }}
      />
      <span
        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
          website.pinned
            ? "bg-green-500 text-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {website.pinned ? "Pinned" : "Unpinned"}
      </span>
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
      <p>
        <span className="font-semibold">Domain:</span> {website.domain}
      </p>
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

      {/* ✅ Embed Script Button Moved Here */}
      <div className="pt-2">
        <Button
          variant="outline"
          className="w-full border-2 border-primary rounded-full hover:bg-primary/20 text-foreground"
          onClick={() => handleOpenEmbedDialog(website.id)}
        >
          <Target className="mr-2 h-4 w-4" /> Copy Embed Script 
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
              <Label className="mb-2 text-sm font-medium">Font Family</Label>
              <select
                value={editedDefaultFont}
                onChange={(e) => setEditedDefaultFont(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                <option value="'Arial Black', sans-serif">Arial Black</option>
                <option value="Impact, sans-serif">Impact</option>
                <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                <option value="'Lucida Console', monospace">Lucida Console</option>
                <option value="'Palatino Linotype', serif">Palatino Linotype</option>
                <option value="Tahoma, sans-serif">Tahoma</option>
                <option value="'Lucida Sans Unicode', sans-serif">Lucida Sans Unicode</option>
                <option value="'MS Sans Serif', sans-serif">MS Sans Serif</option>
                <option value="'MS Serif', serif">MS Serif</option>
                <option value="'New York', serif">New York</option>
                <option value="'Book Antiqua', serif">Book Antiqua</option>
                <option value="'Garamond', serif">Garamond</option>
                <option value="'Century Gothic', sans-serif">Century Gothic</option>
              </select>
            </div>
            
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