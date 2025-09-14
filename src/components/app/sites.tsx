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
  phone: string;
  userId: string;
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
  const [editedPhone, setEditedPhone] = useState("");
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
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderColor, setBorderColor] = useState("#cccccc");
  const [borderRadius, setBorderRadius] = useState(4);
  const [widgetPosition, setWidgetPosition] = useState("top-right");
  const [animationType, setAnimationType] = useState("fade");
  const [animationDuration, setAnimationDuration] = useState(300);
  const [widgetWidth, setWidgetWidth] = useState(300);
  const [widgetHeight, setWidgetHeight] = useState(200);
  const [padding, setPadding] = useState(16);
  const [margin, setMargin] = useState(10);
  const [fontSize, setFontSize] = useState(14);
  const [fontWeight, setFontWeight] = useState("400");
  const [textAlignment, setTextAlignment] = useState("left");
  const [lineHeight, setLineHeight] = useState(1.5);
  const [boxShadow, setBoxShadow] = useState("0 2px 8px rgba(0,0,0,0.1)");
  const [opacity, setOpacity] = useState(1);
  const [zIndex, setZIndex] = useState(9999);
  const [customCssClasses, setCustomCssClasses] = useState("");
  const [customCssStyles, setCustomCssStyles] = useState("");
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
    const res = await fetch(`/api/client?userId=${userId}`);
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
    setEditedPhone(website.phone);
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
    setBorderWidth(widgetConfig.borderWidth || 1);
    setBorderColor(widgetConfig.borderColor || "#cccccc");
    setBorderRadius(widgetConfig.borderRadius || 4);
    setWidgetPosition(widgetConfig.widgetPosition || "top-right");
    setAnimationType(widgetConfig.animationType || "fade");
    setAnimationDuration(widgetConfig.animationDuration || 300);
    setWidgetWidth(widgetConfig.widgetWidth || 300);
    setWidgetHeight(widgetConfig.widgetHeight || 200);
    setPadding(widgetConfig.padding || 16);
    setMargin(widgetConfig.margin || 10);
    setFontSize(widgetConfig.fontSize || 14);
    setFontWeight(widgetConfig.fontWeight || "400");
    setTextAlignment(widgetConfig.textAlignment || "left");
    setLineHeight(widgetConfig.lineHeight || 1.5);
    setBoxShadow(widgetConfig.boxShadow || "0 2px 8px rgba(0,0,0,0.1)");
    setOpacity(widgetConfig.opacity || 1);
    setZIndex(widgetConfig.zIndex || 9999);
    setCustomCssClasses(widgetConfig.customCssClasses || "");
    setCustomCssStyles(widgetConfig.customCssStyles || "");
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
        borderWidth,
        borderColor,
        borderRadius,
        widgetPosition,
        animationType,
        animationDuration,
        widgetWidth,
        widgetHeight,
        padding,
        margin,
        fontSize,
        fontWeight,
        textAlignment,
        lineHeight,
        boxShadow,
        opacity,
        zIndex,
        customCssClasses,
        customCssStyles,
        attachImage,
        presetText,
      };

      const res = await fetch(`/api/client/${websiteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName,
          domain: editedDomain,
          phone: editedPhone,
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
                phone: editedPhone,
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
      {/* Configure button */}
      <Button
        variant="ghost"
        className="h-8 px-3 rounded-full border border-primary"
        onClick={() => handleEditClick(website)}
      >
         Configure
      </Button>

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
          <Button
            variant="ghost"
            className="justify-start w-full rounded-md hover:bg-secondary/50"
            onClick={() => handleOpenEmbedDialog(website.id)}
          >
            <Target className="mr-2 h-4 w-4" /> Embed Script
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )}
</CardHeader>


                <Separator />
                <CardContent className="px-4 py-1">
  {false ? (
    <div className="space-y-3">
      {/* [Keep all your edit fields exactly as they are] */}
      <div>
        <Label className="mb-2">Business Name</Label>
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Label className="mb-2">Domain</Label>
        <Input
          value={editedDomain}
          onChange={(e) => setEditedDomain(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Label className="mb-2">Phone</Label>
        <Input
          value={editedPhone}
          onChange={(e) => setEditedPhone(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Label className="mb-2">Widget Type</Label>
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
        <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                {editedDefaultType.charAt(0).toUpperCase() + editedDefaultType.slice(1)} Widget
              </p>
              <p className="text-xs text-muted-foreground">
                {widgetTypeInstructions[editedDefaultType as keyof typeof widgetTypeInstructions]}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Label className="mb-2">Font Family</Label>
        <Input
          value={editedDefaultFont}
          onChange={(e) => setEditedDefaultFont(e.target.value)}
        />
      </div>
      <div>
        <Label className="mb-2">Background Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={editedDefaultBgColor}
            onChange={(e) => setEditedDefaultBgColor(e.target.value)}
            className="h-10 w-12 p-1"
          />
          <Input
            value={editedDefaultBgColor}
            onChange={(e) => setEditedDefaultBgColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
      <div>
        <Label className="mb-2">Text Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={editedDefaultTextColor}
            onChange={(e) => setEditedDefaultTextColor(e.target.value)}
            className="h-10 w-12 p-1"
          />
          <Input
            value={editedDefaultTextColor}
            onChange={(e) => setEditedDefaultTextColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
      <div>
        <Label className="mb-2">Dismiss After (ms)</Label>
        <Input
          type="number"
          value={editedDefaultDismissAfter}
          onChange={(e) => setEditedDefaultDismissAfter(Number(e.target.value))}
          placeholder="5000"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button onClick={() => handleSaveClick(website.id)}>Save</Button>
        <Button onClick={handleCancelClick} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      <p>
        <span className="font-semibold">Domain:</span> {website.domain}
      </p>
      <p>
        <span className="font-semibold">Phone:</span> {website.phone}
      </p>
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

      {/* ✅ Embed Script Button Moved Here */}
      <div className="pt-2">
        <Button
          variant="outline"
          className="w-full bg-primary/10 rounded-full hover:bg-primary/20 text-foreground"
          onClick={() => handleOpenEmbedDialog(website.id)}
        >
          <Target className="mr-2 h-4 w-4" /> Copy Embed Script 
        </Button>
      </div>
    </div>
  )}
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
            <SheetTitle className="text-xl sm:text-2xl">Configure Website</SheetTitle>
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
              <Label className="mb-2 text-sm font-medium">Phone</Label>
              <Input
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                className="w-full"
                disabled
              />
            </div>
            
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
              <Label className="mb-2 text-sm font-medium"> Font Family</Label>
              <Input
                value={editedDefaultFont}
                onChange={(e) => setEditedDefaultFont(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Label className="mb-2 text-sm font-medium">Dismiss After (ms)</Label>
              <Input
                type="number"
                value={editedDefaultDismissAfter}
                onChange={(e) => setEditedDefaultDismissAfter(Number(e.target.value))}
                placeholder="5000"
                className="w-full"
              />
            </div>
            
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

            {/* Border and Styling */}
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

            <div>
              <Label className="mb-2 text-sm font-medium">Border Width (px)</Label>
              <Input
                type="number"
                placeholder="1"
                min="0"
                max="10"
                value={borderWidth}
                onChange={(e) => setBorderWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Border Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="h-12 w-16 p-1 rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
                />
                <Input
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#cccccc"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Border Radius (px)</Label>
              <Input
                type="number"
                placeholder="4"
                min="0"
                max="50"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Position and Animation */}
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
              <Label className="mb-2 text-sm font-medium">Animation Duration (ms)</Label>
              <Input
                type="number"
                placeholder="300"
                min="100"
                max="2000"
                value={animationDuration}
                onChange={(e) => setAnimationDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Size and Spacing */}
            <div>
              <Label className="mb-2 text-sm font-medium">Widget Width (px)</Label>
              <Input
                type="number"
                placeholder="300"
                min="100"
                max="800"
                value={widgetWidth}
                onChange={(e) => setWidgetWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Widget Height (px)</Label>
              <Input
                type="number"
                placeholder="200"
                min="50"
                max="600"
                value={widgetHeight}
                onChange={(e) => setWidgetHeight(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Padding (px)</Label>
              <Input
                type="number"
                placeholder="16"
                min="0"
                max="50"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Margin (px)</Label>
              <Input
                type="number"
                placeholder="10"
                min="0"
                max="50"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Text Styling */}
            <div>
              <Label className="mb-2 text-sm font-medium">Font Size (px)</Label>
              <Input
                type="number"
                placeholder="14"
                min="8"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Font Weight</Label>
              <Select value={fontWeight} onValueChange={setFontWeight}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Thin (100)</SelectItem>
                  <SelectItem value="200">Extra Light (200)</SelectItem>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="400">Normal (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semi Bold (600)</SelectItem>
                  <SelectItem value="700">Bold (700)</SelectItem>
                  <SelectItem value="800">Extra Bold (800)</SelectItem>
                  <SelectItem value="900">Black (900)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Text Alignment</Label>
              <Select value={textAlignment} onValueChange={setTextAlignment}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Line Height</Label>
              <Input
                type="number"
                placeholder="1.5"
                min="0.5"
                max="3"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Shadow and Effects */}
            <div>
              <Label className="mb-2 text-sm font-medium">Box Shadow</Label>
              <Input
                placeholder="0 2px 8px rgba(0,0,0,0.1)"
                value={boxShadow}
                onChange={(e) => setBoxShadow(e.target.value)}
                className="w-full font-mono text-sm"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Opacity</Label>
              <Input
                type="number"
                placeholder="1"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Advanced Settings */}
            <div>
              <Label className="mb-2 text-sm font-medium">Z-Index</Label>
              <Input
                type="number"
                placeholder="9999"
                min="1"
                max="99999"
                value={zIndex}
                onChange={(e) => setZIndex(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Custom CSS Classes</Label>
              <Input
                placeholder="my-custom-class another-class"
                value={customCssClasses}
                onChange={(e) => setCustomCssClasses(e.target.value)}
                className="w-full font-mono text-sm"
              />
            </div>

            <div>
              <Label className="mb-2 text-sm font-medium">Custom CSS Styles</Label>
              <textarea
                placeholder="border: 2px solid #ff0000; transform: rotate(5deg);"
                value={customCssStyles}
                onChange={(e) => setCustomCssStyles(e.target.value)}
                className="w-full h-20 p-3 border border-input rounded-md font-mono text-sm resize-none"
              />
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