"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface InstallationGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  siteName?: string;
}

export function InstallationGuideDialog({
  open,
  onOpenChange,
  clientId: _clientId,
  siteName,
}: InstallationGuideDialogProps) {
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
          <li>Add our installer to your platform using the instructions below.</li>
          <li>Once access is granted, our team will install the widget on your site.</li>
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
      </DialogContent>
    </Dialog>
  );
}
