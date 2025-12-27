// app/components/IframeDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
import { toast } from "sonner";


interface IframeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  widgetConfig?: {
    iframeWidth?: string;
    iframeHeight?: string;
  };
}

export function IframeDialog({ open, onOpenChange, clientId, widgetConfig }: IframeDialogProps) {
  const apiBase = process.env.NEXT_PUBLIC_BASE_URL || "https://www.t2ms.biz";
  const [activeTab, setActiveTab] = useState("iframe");
  const iframeWidth = widgetConfig?.iframeWidth || "100%";
  const iframeHeight = widgetConfig?.iframeHeight || "400";
  
  const iframeEmbedCode = `<iframe
  src="${apiBase}/widget/iframe?clientId=${clientId || ''}"
  width="${iframeWidth}"
  height="${iframeHeight}"
  frameborder="0"
  scrolling="no"
  allowtransparency="true"
></iframe>`.trim();

  const iframeScriptEmbedCode = `
<script
  src="${apiBase}/widget/iframe-script"
  data-client-id="${clientId || ''}"
  data-api="${apiBase}"
  defer
></script>`.trim();

  const getCurrentEmbedCode = () => {
    switch (activeTab) {
      case "iframe":
        return iframeEmbedCode;
      case "iframe-script":
        return iframeScriptEmbedCode;
      default:
        return iframeEmbedCode;
    }
  };

  const handleCopy = () => {
    if (!clientId) return;
    navigator.clipboard.writeText(getCurrentEmbedCode());
    toast.success("iFrame embed code copied to clipboard!");
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "iframe":
        return "Direct iframe embed. Best for restricted platforms like Google Sites, Wix, Squarespace, etc. Adjust the height style as needed.";
      case "iframe-script":
        return "Script that injects an iframe. Good for platforms that allow scripts but not direct iframe tags.";
      default:
        return "Copy and paste this code for Google Sites or platforms that restrict JavaScript.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[550px] w-full max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (open) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Embed iFrame</DialogTitle>
          <DialogDescription>
            {getTabDescription()}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="iframe-script">iFrame Script</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">iFrame Embed Code</label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Direct iframe tag. Best for restricted platforms like Google Sites, Wix, Squarespace, etc.
              </p>
              <Textarea
                value={iframeEmbedCode}
                readOnly
                rows={6}
                className="font-mono text-sm leading-tight mt-1 bg-background"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          </TabsContent>

          <TabsContent value="iframe-script" className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">iFrame Script Embed Code</label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Script that dynamically injects an iframe. Useful when platforms allow scripts but not direct iframe tags.
              </p>
              <Textarea
                value={iframeScriptEmbedCode}
                readOnly
                rows={4}
                className="font-mono text-sm leading-tight mt-1 bg-background"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleCopy} className="w-full">
          <Copy className="w-4 h-4 mr-2" /> Copy iFrame Code
        </Button>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

