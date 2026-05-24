// app/components/IframeDialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { getEmbedApiBase } from "@/lib/embed-base-url";
import { IFRAME_EMBED_PRESETS } from "@/lib/widget-iframe-presets";

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
  const [apiBase, setApiBase] = useState("https://www.t2ms.biz");
  const [activeTab, setActiveTab] = useState("iframe");
  const [presetId, setPresetId] = useState("general");

  useEffect(() => {
    if (open) {
      setApiBase(getEmbedApiBase());
    }
  }, [open]);

  const preset = useMemo(
    () => IFRAME_EMBED_PRESETS.find((p) => p.id === presetId) ?? IFRAME_EMBED_PRESETS[3],
    [presetId]
  );

  const iframeWidth = widgetConfig?.iframeWidth || preset.width;
  const iframeHeight = widgetConfig?.iframeHeight || preset.height;

  const iframeEmbedCode = `<iframe
  src="${apiBase}/widget/iframe?clientId=${clientId || ""}"
  width="${iframeWidth}"
  height="${iframeHeight}"
  style="border:0;width:${iframeWidth};min-height:80px;max-width:100%;display:block;"
  frameborder="0"
  scrolling="auto"
  allowtransparency="true"
  title="T2MS Announcements"
></iframe>`.trim();

  const iframeScriptEmbedCode = `<script
  src="${apiBase}/widget/iframe-script"
  data-client-id="${clientId || ""}"
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
        return `Direct iframe embed. ${preset.note}`;
      case "iframe-script":
        return "Script that injects an iframe. Good for platforms that allow scripts but not direct iframe tags.";
      default:
        return preset.note;
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
          <DialogDescription>{getTabDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Platform preset</label>
          <Select value={presetId} onValueChange={setPresetId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose platform" />
            </SelectTrigger>
            <SelectContent>
              {IFRAME_EMBED_PRESETS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label} — {p.height}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{preset.note}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="iframe-script">iFrame Script</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">iFrame embed code</label>
              <Textarea
                value={iframeEmbedCode}
                readOnly
                rows={8}
                className="font-mono text-sm leading-tight mt-2 bg-background"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          </TabsContent>

          <TabsContent value="iframe-script" className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">iFrame script embed code</label>
              <Textarea
                value={iframeScriptEmbedCode}
                readOnly
                rows={5}
                className="font-mono text-sm leading-tight mt-2 bg-background"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleCopy} className="w-full">
          <Copy className="w-4 h-4 mr-2" /> Copy embed code
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
