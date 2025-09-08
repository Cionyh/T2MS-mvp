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

  const [showClientId, setShowClientId] = useState<Record<string, boolean>>({});
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);

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
    setEditingWebsiteId(website.id);
    setEditedName(website.name);
    setEditedDomain(website.domain);
    setEditedPhone(website.phone);
    setEditedDefaultType(website.defaultType || "banner");
    setEditedDefaultBgColor(website.defaultBgColor || "#222");
    setEditedDefaultTextColor(website.defaultTextColor || "#fff");
    setEditedDefaultFont(website.defaultFont || "sans-serif");
    setEditedDefaultDismissAfter(website.defaultDismissAfter ?? 5000);
  };

  const handleSaveClick = async (websiteId: string) => {
    try {
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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update website");
      }

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
              }
            : site
        )
      );

      setEditingWebsiteId(null);
      toast.success("Website updated successfully!");
      router.refresh();
    } catch (error: any) {
      console.error("Error updating website:", error);
      toast.error(error.message || "Failed to update website.");
    }
  };

  const handleCancelClick = () => {
    setEditingWebsiteId(null);
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
  {editingWebsiteId === website.id ? (
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
        <Label className="mb-2">Default Widget Type</Label>
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
        <Label className="mb-2">Default Font Family</Label>
        <Input
          value={editedDefaultFont}
          onChange={(e) => setEditedDefaultFont(e.target.value)}
        />
      </div>
      <div>
        <Label className="mb-2">Default Background Color</Label>
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
        <Label className="mb-2">Default Text Color</Label>
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
        <Label className="mb-2">Default Dismiss After (ms)</Label>
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
    </div>
  );
}