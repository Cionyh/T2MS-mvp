// app/components/EmbedDialog.tsx
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


interface EmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
}

export function EmbedDialog({ open, onOpenChange, clientId }: EmbedDialogProps) {
  const embedCode = `
<script
  src="https://www.t2ms.biz/widget"
  data-client-id="${clientId || ''}"
  data-api="https://www.t2ms.biz"
  defer
></script>`.trim();

  const handleCopy = () => {
    if (!clientId) return;
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard!");
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
          <DialogTitle>Embed Script</DialogTitle>
          <DialogDescription>
            Copy and paste this code into your website's HTML.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Embed Code</label>
            <Textarea
              value={embedCode}
              readOnly
              rows={5}
              className="font-mono text-sm leading-tight mt-1 bg-background"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>

          <Button onClick={handleCopy} className="w-full">
            <Copy className="w-4 h-4 mr-2" /> Copy Embed Code
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