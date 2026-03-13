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

        <div className="mb-6 space-y-4 text-sm">
          <p className="font-semibold">Instructions to allow widget installation</p>

          <div>
            <p className="font-semibold">WordPress</p>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-muted-foreground">
              <li>Log in to your WordPress dashboard.</li>
              <li>Go to <strong>Users → Add New User</strong>.</li>
              <li>Enter: <code>install@t2ms.biz</code>.</li>
              <li>Set the role to <strong>Administrator</strong>.</li>
              <li>Click <strong>Add New User</strong>.</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              Important: We will not be able to install your widget until we receive the access invitation from WordPress.
            </p>
          </div>

          <div>
            <p className="font-semibold">Squarespace</p>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-muted-foreground">
              <li>Log in to your Squarespace account.</li>
              <li>Go to <strong>Settings → Permissions</strong>.</li>
              <li>Click <strong>Invite Contributor</strong>.</li>
              <li>Enter: <code>install@t2ms.biz</code>.</li>
              <li>Assign the appropriate admin-level permission needed for installation.</li>
              <li>Send the invite.</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              Important: We will not be able to install your widget until we receive the access invitation from Squarespace.
            </p>
          </div>

          <div>
            <p className="font-semibold">Wix</p>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-muted-foreground">
              <li>Log in to your Wix account.</li>
              <li>Go to <strong>Settings → Roles &amp; Permissions</strong>.</li>
              <li>Click <strong>Invite People</strong>.</li>
              <li>Enter: <code>install@t2ms.biz</code>.</li>
              <li>Assign admin/editor permissions needed for installation.</li>
              <li>Send the invite.</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              Important: We will not be able to install your widget until we receive the access invitation from Wix.
            </p>
          </div>

          <div>
            <p className="font-semibold">Shopify</p>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-muted-foreground">
              <li>Log in to your Shopify admin.</li>
              <li>Go to <strong>Settings → Users and Permissions</strong>.</li>
              <li>Click <strong>Add Staff</strong>.</li>
              <li>Enter: <code>install@t2ms.biz</code>.</li>
              <li>Grant the permissions needed for theme/widget installation.</li>
              <li>Send the invite.</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              Important: We will not be able to install your widget until we receive the access invitation from Shopify.
            </p>
          </div>

          <div>
            <p className="font-semibold">Webflow</p>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-muted-foreground">
              <li>Log in to your Webflow account.</li>
              <li>Open your site settings.</li>
              <li>Go to workspace/site access settings.</li>
              <li>Invite <code>install@t2ms.biz</code> with the permissions needed for installation.</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              Important: We will not be able to install your widget until we receive the access invitation from Webflow.
            </p>
          </div>

          <div>
            <p className="font-semibold">GoDaddy Website Builder</p>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-muted-foreground">
              <li>Log in to your GoDaddy account.</li>
              <li>Open your website product/dashboard.</li>
              <li>Go to user or collaborator access if available.</li>
              <li>Invite <code>install@t2ms.biz</code> with the permissions needed for installation.</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              Important: We will not be able to install your widget until we receive the access invitation from GoDaddy.
            </p>
          </div>

          <div>
            <p className="font-semibold">Joomla</p>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-muted-foreground">
              <li>Log in to your Joomla administrator panel.</li>
              <li>Go to <strong>Users</strong>.</li>
              <li>Add a new user with <code>install@t2ms.biz</code>.</li>
              <li>Assign administrator-level access needed for installation.</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              Important: We will not be able to install your widget until we receive the access invitation from Joomla.
            </p>
          </div>
        </div>

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
