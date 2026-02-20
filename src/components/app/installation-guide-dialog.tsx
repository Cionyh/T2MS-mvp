"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface InstallationGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  siteName?: string;
}

export function InstallationGuideDialog({
  open,
  onOpenChange,
  clientId,
  siteName,
}: InstallationGuideDialogProps) {
  const apiBase = process.env.NEXT_PUBLIC_WIDGET_API_URL || "https://www.t2ms.biz";

  const scriptEmbedCode = `
<script
  src="${apiBase}/widget"
  data-client-id="${clientId || ""}"
  data-api="${apiBase}"
  defer
></script>`.trim();

  const iframeEmbedCode = `<iframe
  src="${apiBase}/widget/iframe?clientId=${clientId || ""}"
  width="100%"
  height="400"
  frameborder="0"
  scrolling="no"
  allowtransparency="true"
></iframe>`.trim();

  const iframeScriptEmbedCode = `
<script
  src="${apiBase}/widget/iframe-script"
  data-client-id="${clientId || ""}"
  data-api="${apiBase}"
  defer
></script>`.trim();

  const handleCopyScript = () => {
    if (!clientId) return;
    navigator.clipboard.writeText(scriptEmbedCode);
    toast.success("Script embed code copied!");
  };

  const handleCopyIframe = () => {
    if (!clientId) return;
    navigator.clipboard.writeText(iframeEmbedCode);
    toast.success("iFrame embed code copied!");
  };

  const handleCopyIframeScript = () => {
    if (!clientId) return;
    navigator.clipboard.writeText(iframeScriptEmbedCode);
    toast.success("iFrame script embed code copied!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Installation Guide</DialogTitle>
          <DialogDescription>
            {siteName ? (
              <>Follow these steps to install the T2MS widget on {siteName}.</>
            ) : (
              <>Follow these steps to install the T2MS widget on your website.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
          <li>Copy the script embed or iFrame embed code below.</li>
          <li>Get access to the page where you want to place the widget.</li>
          <li>Paste the script on that page, then save and publish your page.</li>
          <li>
            Send SMS on <span className="font-semibold text-foreground">1 (424) 484-8267</span> from your verified number to place messages on the widget.
          </li>
        </ol>

        <Tabs defaultValue="script" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="script">Script Embed</TabsTrigger>
            <TabsTrigger value="iframe">iFrame Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="script" className="space-y-4 mt-4">
            <div>
              <p className="text-sm font-medium mb-2">Standard script embed</p>
              <p className="text-sm text-muted-foreground mb-2">
                Works on most websites that allow external scripts. Add this code before the closing{" "}
                <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag.
              </p>
              <Textarea
                value={scriptEmbedCode}
                readOnly
                rows={6}
                className="font-mono text-sm bg-muted"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleCopyScript}
                disabled={!clientId}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="iframe" className="space-y-4 mt-4">
            <div>
              <p className="text-sm font-medium mb-2">Direct iFrame</p>
              <p className="text-sm text-muted-foreground mb-2">
                For Google Sites, Wix, Squarespace and other platforms that restrict scripts.
              </p>
              <Textarea
                value={iframeEmbedCode}
                readOnly
                rows={8}
                className="font-mono text-sm bg-muted"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleCopyIframe}
                disabled={!clientId}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">iFrame script (alternative)</p>
              <p className="text-sm text-muted-foreground mb-2">
                Script that injects an iframe. Use when platforms allow scripts but not direct iframe tags.
              </p>
              <Textarea
                value={iframeScriptEmbedCode}
                readOnly
                rows={6}
                className="font-mono text-sm bg-muted"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleCopyIframeScript}
                disabled={!clientId}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
