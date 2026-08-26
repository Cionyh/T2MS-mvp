"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { getEmbedApiBase } from "@/lib/embed-base-url"
import { IFRAME_EMBED_PRESETS } from "@/lib/widget-iframe-presets"
import {
  WIDGET_EMBED_CLIENT_ID_PLACEHOLDER,
  buildIframeEmbedSnippet,
  buildIframeScriptEmbedSnippet,
  buildScriptEmbedSnippet,
} from "@/lib/widget-embed-snippets"

type GenericEmbedGuideDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenericEmbedGuideDialog({
  open,
  onOpenChange,
}: GenericEmbedGuideDialogProps) {
  const [apiBase, setApiBase] = useState("https://www.t2ms.biz")
  const [activeTab, setActiveTab] = useState("script")
  const [presetId, setPresetId] = useState("general")

  useEffect(() => {
    if (open) {
      setApiBase(getEmbedApiBase())
    }
  }, [open])

  const preset = useMemo(
    () =>
      IFRAME_EMBED_PRESETS.find((p) => p.id === presetId) ??
      IFRAME_EMBED_PRESETS[3],
    [presetId]
  )

  const clientId = WIDGET_EMBED_CLIENT_ID_PLACEHOLDER

  const scriptEmbedCode = buildScriptEmbedSnippet(apiBase, clientId)
  const iframeEmbedCode = buildIframeEmbedSnippet(
    apiBase,
    clientId,
    preset.width,
    preset.height
  )
  const iframeScriptEmbedCode = buildIframeScriptEmbedSnippet(apiBase, clientId)

  const getCurrentEmbedCode = () => {
    switch (activeTab) {
      case "script":
        return scriptEmbedCode
      case "iframe":
        return iframeEmbedCode
      case "iframe-script":
        return iframeScriptEmbedCode
      default:
        return scriptEmbedCode
    }
  }

  const getTabDescription = () => {
    switch (activeTab) {
      case "script":
        return "Standard script embed — works on most websites that allow external scripts. Paste before the closing </body> tag."
      case "iframe":
        return `Direct iframe embed. ${preset.note}`
      case "iframe-script":
        return "Script that injects an iframe. Use when your platform allows scripts but blocks raw iframe HTML."
      default:
        return ""
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentEmbedCode())
    toast.success(
      `Embed code copied — replace ${WIDGET_EMBED_CLIENT_ID_PLACEHOLDER} with your site's Client ID.`
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Embed widget on your website</DialogTitle>
          <DialogDescription>
            Use the same embed code for any site. Replace{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              {WIDGET_EMBED_CLIENT_ID_PLACEHOLDER}
            </code>{" "}
            with that site&apos;s Client ID before pasting into your website.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm space-y-2">
            <p className="font-semibold">Where to find your Client ID</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                On this page, open the site card for the website you want to
                update.
              </li>
              <li>
                Find <strong className="text-foreground">Client ID (widget embed)</strong>{" "}
                at the bottom of the card.
              </li>
              <li>
                Click the eye icon to reveal the full ID, then the copy icon to
                copy it.
              </li>
              <li>
                Paste that ID over{" "}
                <code className="rounded bg-background px-1 text-xs">
                  {WIDGET_EMBED_CLIENT_ID_PLACEHOLDER}
                </code>{" "}
                in the embed code below.
              </li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Client ID is only for the website widget — it is not used when
              texting announcements.
            </p>
          </div>

          {activeTab === "iframe" ? (
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
            </div>
          ) : null}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="iframe">iFrame</TabsTrigger>
              <TabsTrigger value="iframe-script">iFrame script</TabsTrigger>
            </TabsList>

            <p className="text-xs text-muted-foreground pt-3">
              {getTabDescription()}
            </p>

            <TabsContent value="script" className="mt-3">
              <Textarea
                value={scriptEmbedCode}
                readOnly
                rows={6}
                className="font-mono text-sm leading-tight bg-background"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </TabsContent>

            <TabsContent value="iframe" className="mt-3">
              <Textarea
                value={iframeEmbedCode}
                readOnly
                rows={9}
                className="font-mono text-sm leading-tight bg-background"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </TabsContent>

            <TabsContent value="iframe-script" className="mt-3">
              <Textarea
                value={iframeScriptEmbedCode}
                readOnly
                rows={6}
                className="font-mono text-sm leading-tight bg-background"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </TabsContent>
          </Tabs>

          <Button onClick={handleCopy} className="w-full">
            <Copy className="w-4 h-4 mr-2" />
            Copy embed code
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Need platform-specific steps?{" "}
            <a
              href="/configure_widget_settings.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground underline underline-offset-2"
            >
              Widget Settings Guide
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
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
  )
}
