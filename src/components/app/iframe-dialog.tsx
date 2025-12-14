// app/components/IframeDialog.tsx
"use client";

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
  const iframeWidth = widgetConfig?.iframeWidth || "100%";
  const iframeHeight = widgetConfig?.iframeHeight || "100vh";
  
  const iframeEmbedCode = `
<iframe 
  src="https://www.t2ms.biz/display?channel=${clientId || ''}" 
  style="width:${iframeWidth};height:${iframeHeight};border:none;overflow:hidden;"
  title="T2MS Widget"
></iframe>`.trim();

  const handleCopy = () => {
    if (!clientId) return;
    navigator.clipboard.writeText(iframeEmbedCode);
    toast.success("iFrame embed code copied to clipboard!");
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
            Copy and paste this iFrame code for Google Sites or platforms that restrict JavaScript. Adjust the height style as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">iFrame Embed Code</label>
            <Textarea
              value={iframeEmbedCode}
              readOnly
              rows={6}
              className="font-mono text-sm leading-tight mt-1 bg-background"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>

          <Button onClick={handleCopy} className="w-full">
            <Copy className="w-4 h-4 mr-2" /> Copy iFrame Code
          </Button>
        </div>

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

