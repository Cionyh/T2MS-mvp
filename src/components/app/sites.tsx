"use client";
/* eslint-disable */

import { useState, useEffect, useMemo } from "react";
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
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DotPattern } from "../magicui/dot-pattern";
import { cn } from "@/lib/utils";

interface Website {
  id: string;
  name: string;
  domain: string;
  phone: string;
  userId: string;
}

// Framer Motion Variants
const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

interface DashboardClientProps {
  initialWebsites: Website[];
}

export default function DashboardClient({
  initialWebsites,
}: Readonly<DashboardClientProps>) {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [editingWebsiteId, setEditingWebsiteId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDomain, setEditedDomain] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [showClientId, setShowClientId] = useState<Record<string, boolean>>(
    {}
  ); // State to manage visibility of client IDs
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null); // Track which website's embed dialog is open
  const [widgetType, setWidgetType] = useState("banner");
  const [bgColor, setBgColor] = useState("#222");
  const [textColor, setTextColor] = useState("#fff");
  const [font, setFont] = useState("sans-serif");

  useEffect(() => {
    if (initialWebsites) {
      setWebsites(initialWebsites);
    }
  }, [initialWebsites]);

  const handleNewSiteClick = () => {
    router.push("/app/build");
  };

  const handleEditClick = (website: Website) => {
    setEditingWebsiteId(website.id);
    setEditedName(website.name);
    setEditedDomain(website.domain);
    setEditedPhone(website.phone);
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
      [websiteId]: ! (prev[websiteId] || false),
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

  const handleCloseEmbedDialog = () => {
    setEmbedDialogOpen(false);
  };

  const embedCode = useMemo(() => {
    if (!selectedWebsiteId) return "";
    return `<script 
  src="https://t2ms-production.up.railway.app/widget"
  data-client-id="${selectedWebsiteId}"
  data-type="${widgetType}"
  data-bg="${bgColor}"
  data-color="${textColor}"
  data-font="${font}"
  data-api="https://t2ms-production.up.railway.app"
  defer
></script>`;
  }, [selectedWebsiteId, widgetType, bgColor, textColor, font]);

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard!");
  };

  return (
    <div className="container mx-auto py-2">
       <DotPattern
        className={cn(
          "-z-50", 
          "[mask-image:radial-gradient(10000px_circle_at_center,white,transparent)]"
        )}
      />
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Registered Sites</h2>
        <Button onClick={handleNewSiteClick} className="text-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add New Site
        </Button>
      </div>

      {/* Website List or Empty State */}
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
                <CardHeader className="flex items-center justify-between px-4 py-3">
                  <CardTitle className="text-lg font-medium">
                    {website.name}
                  </CardTitle>
                  {editingWebsiteId !== website.id && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-[160px] p-2"
                      >
                        <Button
                          variant="ghost"
                          className="justify-start w-full rounded-md hover:bg-secondary/50"
                          onClick={() => handleEditClick(website)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="justify-start w-full rounded-md hover:bg-secondary/50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the website from our servers.
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
                  )}
                </CardHeader>

                <Separator className="my-1 mx-30" />
                <CardContent className="p-4">
                  {editingWebsiteId === website.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`name-${website.id}`} className="mb-2">
                          Business Name
                        </Label>
                        <Input
                          id={`name-${website.id}`}
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`domain-${website.id}`} className="mb-2">Domain</Label>
                        <Input
                          id={`domain-${website.id}`}
                          value={editedDomain}
                          onChange={(e) => setEditedDomain(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`phone-${website.id}`} className="mb-2">Phone</Label>
                        <Input
                          id={`phone-${website.id}`}
                          value={editedPhone}
                          onChange={(e) => setEditedPhone(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button onClick={() => handleSaveClick(website.id)}>
                          Save
                        </Button>
                        <Button onClick={handleCancelClick} variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>
                        <span className="font-semibold">Domain:</span>{" "}
                        {website.domain}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {website.phone}
                      </p>
                      <p className="flex items-center space-x-2">
                        <span className="font-semibold">Client ID:</span>
                        <span className="font-mono text-sm">
                          {showClientId[website.id]
                            ? website.id
                            : website.id.slice(0, 6) + "..."}
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
                          <span className="sr-only">
                            {showClientId[website.id] ? "Hide" : "Show"} Client ID
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyClientId(website.id)}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy Client ID</span>
                        </Button>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Embed Script Dialog */}
<Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
  <DialogContent className="sm:max-w-[550px] w-full max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Embed Script Configuration</DialogTitle>
      <DialogDescription>
        Configure the widget and copy the embed code.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Widget Type */}
        <div>
          <Label htmlFor="widget-type" className="mb-2">Widget Type</Label>
          <Select onValueChange={setWidgetType} defaultValue={widgetType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="popup">Popup</SelectItem>
              <SelectItem value="fullscreen">Fullscreen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font */}
        <div>
          <Label htmlFor="font" className="mb-2">Font</Label>
          <Input
            id="font"
            value={font}
            onChange={(e) => setFont(e.target.value)}
            placeholder="sans-serif"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Background Color */}
        <div>
          <Label htmlFor="bg-color" className="mb-2">Background Color</Label>
          <Input
            type="color"
            id="bg-color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Text Color */}
        <div>
          <Label htmlFor="text-color" className="mb-2">Text Color</Label>
          <Input
            type="color"
            id="text-color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Embed Code */}
      <div>
        <Label className="mb-2">Embed Code</Label>
        <Textarea
          value={embedCode}
          rows={4}
          readOnly
          className="font-mono w-full" // Added w-full
        />
      </div>

      {/* Copy Button */}
      <Button onClick={handleCopyEmbedCode} className="w-full">
        <Copy className="w-4 h-4 mr-2" /> Copy Embed Code
      </Button>
    </div>

    <DialogFooter>
      <DialogClose asChild>
        <Button
          type="button"
          variant="secondary"
          onClick={handleCloseEmbedDialog}
        >
          Close
        </Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}