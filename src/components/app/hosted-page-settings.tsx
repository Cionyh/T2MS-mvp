"use client"

import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ExternalLink, Copy } from "lucide-react"
import { toast } from "sonner"
import { getHostedPageDomain } from "@/lib/hosted-page/constants"
import { slugFromSiteName } from "@/lib/hosted-page/slug"
import {
  HOSTED_THEMES,
  getHostedThemeMeta,
  normalizeHostedTheme,
  type HostedThemeId,
} from "@/lib/hosted-page/themes"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  parseYoutubeVideoId,
  youtubeThumbnailUrl,
} from "@/lib/youtube-embed"

type HostedPageSettingsProps = {
  clientId: string
  siteName: string
  /** Prefer publish on for first-time setup (e.g. onboarding) when no slug saved yet */
  defaultPublishOn?: boolean
  /** Primary action label (dashboard: "Save hosted page") */
  saveLabel?: string
  /** Full-width primary button (onboarding) */
  saveButtonFullWidth?: boolean
  onSaved?: (data: {
    hostedSlug: string | null
    hostedEnabled: boolean
  }) => void | Promise<void>
}

type HostedState = {
  hostedSlug: string | null
  hostedEnabled: boolean
  hostedIntroText: string | null
  hostedFooterText: string | null
  hostedTheme: HostedThemeId
  publicUrls: {
    path: string
    subdomain: string
  } | null
}

export function HostedPageSettings({
  clientId,
  siteName,
  defaultPublishOn = false,
  saveLabel = "Save hosted page",
  saveButtonFullWidth = false,
  onSaved,
}: HostedPageSettingsProps) {
  const domain = getHostedPageDomain()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slugInput, setSlugInput] = useState("")
  const [introText, setIntroText] = useState("")
  const [footerText, setFooterText] = useState("")
  const [theme, setTheme] = useState<HostedThemeId>("classic")
  const [showLogo, setShowLogo] = useState(true)
  const [showWebsiteLink, setShowWebsiteLink] = useState(false)
  const [companyWebsiteLink, setCompanyWebsiteLink] = useState<string | null>(
    null
  )
  const [logoUrl, setLogoUrl] = useState("")
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("")
  const [contentImageUrl, setContentImageUrl] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [logoUploading, setLogoUploading] = useState(false)
  const [backgroundUploading, setBackgroundUploading] = useState(false)
  const [contentImageUploading, setContentImageUploading] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [publicUrls, setPublicUrls] = useState<HostedState["publicUrls"]>(null)
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [slugSuggestedFromName, setSlugSuggestedFromName] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/client/${clientId}/hosted`)
      if (!res.ok) throw new Error("Failed to load hosted page settings")
      const data = await res.json()
      if (data.hostedSlug) {
        setSlugInput(data.hostedSlug)
        setSlugSuggestedFromName(false)
        setSlugStatus("available")
      } else {
        const suggested = slugFromSiteName(siteName)
        if (suggested) {
          setSlugInput(suggested)
          setSlugSuggestedFromName(true)
          setSlugStatus("idle")
        } else {
          setSlugInput("")
          setSlugSuggestedFromName(false)
          setSlugStatus("idle")
        }
      }
      setIntroText(data.hostedIntroText ?? "")
      setFooterText(data.hostedFooterText ?? "")
      setTheme(normalizeHostedTheme(data.hostedTheme))
      setShowLogo(data.hostedShowLogo !== false)
      setShowWebsiteLink(Boolean(data.hostedShowWebsiteLink))
      setCompanyWebsiteLink(
        typeof data.companyWebsiteLink === "string" &&
          data.companyWebsiteLink.trim()
          ? data.companyWebsiteLink.trim()
          : null
      )
      setLogoUrl(data.hostedLogoUrl ?? "")
      setBackgroundImageUrl(data.hostedBackgroundImageUrl ?? "")
      setContentImageUrl(data.hostedContentImageUrl ?? "")
      setYoutubeUrl(data.hostedYoutubeUrl ?? "")
      // First-time setup: default publish on when no slug has been saved yet
      if (data.hostedSlug) {
        setEnabled(Boolean(data.hostedEnabled))
      } else {
        setEnabled(Boolean(data.hostedEnabled) || defaultPublishOn)
      }
      setPublicUrls(data.publicUrls ?? null)
    } catch {
      toast.error("Could not load hosted page settings")
    } finally {
      setLoading(false)
    }
  }, [clientId, siteName, defaultPublishOn])

  useEffect(() => {
    load()
  }, [load])

  const uploadHostedImage = async (
    file: File,
    which: "logo" | "background" | "content"
  ) => {
    const setBusy =
      which === "logo"
        ? setLogoUploading
        : which === "background"
          ? setBackgroundUploading
          : setContentImageUploading
    const setUrl =
      which === "logo"
        ? setLogoUrl
        : which === "background"
          ? setBackgroundImageUrl
          : setContentImageUrl
    setBusy(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("purpose", "hosted")
      const res = await fetch(`/api/client/${clientId}/widget-upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }
      if (!data.url) {
        throw new Error("Upload did not return a URL")
      }
      setUrl(data.url as string)
      toast.success(
        which === "logo"
          ? "Logo uploaded"
          : which === "background"
            ? "Background uploaded"
            : "Content image uploaded"
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  const checkSlug = useCallback(
    async (value: string) => {
      if (!value.trim()) {
        setSlugStatus("idle")
        setSuggestions([])
        return
      }
      setSlugStatus("checking")
      try {
        const params = new URLSearchParams({
          slug: value,
          excludeClientId: clientId,
        })
        const res = await fetch(`/api/hosted/slug/check?${params}`)
        const data = await res.json()
        if (data.available) {
          setSlugStatus("available")
          setSuggestions([])
        } else if (data.slug) {
          setSlugStatus("taken")
          setSuggestions(data.suggestions ?? [])
        } else {
          setSlugStatus("invalid")
          setSuggestions([])
        }
      } catch {
        setSlugStatus("idle")
      }
    },
    [clientId]
  )

  useEffect(() => {
    const t = setTimeout(() => {
      checkSlug(slugInput)
    }, 400)
    return () => clearTimeout(t)
  }, [slugInput, checkSlug])

  const handleSave = async () => {
    const slug = slugInput.trim()

    if (enabled && !slug) {
      toast.error("Choose a page URL name before publishing.")
      return false
    }

    const trimmedYoutube = youtubeUrl.trim()
    if (trimmedYoutube && !parseYoutubeVideoId(trimmedYoutube)) {
      toast.error(
        "Enter a valid YouTube link (youtube.com/watch, youtu.be, Shorts, or embed)."
      )
      return false
    }

    // Re-check slug availability right before publish so suggested names work
    let currentSlugStatus = slugStatus
    if (enabled && slug && slugStatus !== "available") {
      setSlugStatus("checking")
      try {
        const params = new URLSearchParams({
          slug,
          excludeClientId: clientId,
        })
        const res = await fetch(`/api/hosted/slug/check?${params}`)
        const data = await res.json()
        if (data.available) {
          currentSlugStatus = "available"
          setSlugStatus("available")
          setSuggestions([])
        } else if (data.slug) {
          setSlugStatus("taken")
          setSuggestions(data.suggestions ?? [])
          toast.error("Choose an available page name before publishing.")
          return false
        } else {
          setSlugStatus("invalid")
          toast.error("Choose a valid page name before publishing.")
          return false
        }
      } catch {
        toast.error("Could not verify page name availability. Try again.")
        return false
      }
    }

    if (enabled && currentSlugStatus !== "available") {
      toast.error("Choose an available page name before publishing.")
      return false
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/client/${clientId}/hosted`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostedSlug: slug || null,
          hostedEnabled: enabled,
          hostedIntroText: introText,
          hostedFooterText: footerText,
          hostedTheme: theme,
          hostedShowLogo: showLogo,
          hostedShowWebsiteLink: companyWebsiteLink
            ? showWebsiteLink
            : false,
          hostedLogoUrl: logoUrl.trim() || null,
          hostedBackgroundImageUrl: backgroundImageUrl.trim() || null,
          hostedContentImageUrl: contentImageUrl.trim() || null,
          hostedYoutubeUrl: youtubeUrl.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to save")
      }
      setPublicUrls(data.data?.publicUrls ?? null)
      if (data.data?.hostedTheme) {
        setTheme(normalizeHostedTheme(data.data.hostedTheme))
      }
      if (typeof data.data?.hostedShowLogo === "boolean") {
        setShowLogo(data.data.hostedShowLogo)
      }
      if (typeof data.data?.hostedShowWebsiteLink === "boolean") {
        setShowWebsiteLink(data.data.hostedShowWebsiteLink)
      }
      if (data.data?.hostedLogoUrl !== undefined) {
        setLogoUrl(data.data.hostedLogoUrl ?? "")
      }
      if (data.data?.hostedBackgroundImageUrl !== undefined) {
        setBackgroundImageUrl(data.data.hostedBackgroundImageUrl ?? "")
      }
      if (data.data?.hostedContentImageUrl !== undefined) {
        setContentImageUrl(data.data.hostedContentImageUrl ?? "")
      }
      if (data.data?.hostedYoutubeUrl !== undefined) {
        setYoutubeUrl(data.data.hostedYoutubeUrl ?? "")
      }
      if (typeof data.data?.hostedEnabled === "boolean") {
        setEnabled(data.data.hostedEnabled)
      }
      const savedPayload = {
        hostedSlug: data.data?.hostedSlug ?? (slug || null),
        hostedEnabled: Boolean(data.data?.hostedEnabled ?? enabled),
      }
      await onSaved?.(savedPayload)
      toast.success(
        saveLabel.toLowerCase().includes("finish")
          ? "Hosted page saved. Finishing setup…"
          : "Hosted page settings saved"
      )
      return true
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
      return false
    } finally {
      setSaving(false)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("Link copied")
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading hosted page…
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div>
        <h3 className="text-sm font-semibold">Hosted announcement page</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Share a standalone live page (no widget install required). Branding
          below is only for this page — not the website widget on {siteName}.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hosted-slug">Page URL name</Label>
        <p className="text-xs text-muted-foreground">
          This becomes your public web address — the link you share with
          visitors (e.g.{" "}
          <span className="font-mono">your-name.{domain}</span>).
        </p>
        <div className="flex items-center gap-2">
          <Input
            id="hosted-slug"
            value={slugInput}
            onChange={(e) => {
              setSlugInput(e.target.value)
              setSlugSuggestedFromName(false)
            }}
            placeholder="your-organization"
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground shrink-0">
            .{domain}
          </span>
        </div>
        {slugSuggestedFromName && slugInput && (
          <p className="text-xs text-muted-foreground">
            Suggested from &quot;{siteName}&quot; — edit if you&apos;d like a
            different address.
          </p>
        )}
        {slugStatus === "checking" && (
          <p className="text-xs text-muted-foreground">Checking availability…</p>
        )}
        {slugStatus === "available" && slugInput && (
          <p className="text-xs text-green-600 dark:text-green-400">
            Available: {slugInput}.{domain}
          </p>
        )}
        {slugStatus === "taken" && (
          <p className="text-xs text-destructive">
            That name is taken.
            {suggestions.length > 0 && (
              <>
                {" "}
                Try:{" "}
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="underline mr-1"
                    onClick={() => setSlugInput(s)}
                  >
                    {s}
                  </button>
                ))}
              </>
            )}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hosted-theme">Page style</Label>
        <p className="text-xs text-muted-foreground">
          Choose how your public announcement page looks. Your logo, brand
          colors, and latest message still apply where the layout supports them.
        </p>
        <Select
          value={theme}
          onValueChange={(value) => setTheme(normalizeHostedTheme(value))}
        >
          <SelectTrigger id="hosted-theme" className="w-full">
            <SelectValue placeholder="Select a page style" />
          </SelectTrigger>
          <SelectContent>
            {HOSTED_THEMES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {getHostedThemeMeta(theme).description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="hosted-show-logo">Show logo on announcement page</Label>
          <p className="text-xs text-muted-foreground">
            Uses the announcement page logo below (separate from widget logo).
          </p>
        </div>
        <Switch
          id="hosted-show-logo"
          checked={showLogo}
          onCheckedChange={setShowLogo}
        />
      </div>

      <div className="space-y-2">
        <Label>Announcement page logo</Label>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, or GIF (max 5MB). Separate from the website widget
          logo.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            id="hosted-logo-upload"
            disabled={logoUploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ""
              if (file) void uploadHostedImage(file, "logo")
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            disabled={logoUploading}
            onClick={() => document.getElementById("hosted-logo-upload")?.click()}
          >
            {logoUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Upload logo"
            )}
          </Button>
          <Input
            type="text"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full flex-1"
          />
        </div>
        {logoUrl ? (
          <div className="rounded-md border bg-background p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Preview</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setLogoUrl("")}
              >
                Remove
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Announcement logo preview"
              className="max-h-16 max-w-full object-contain"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Announcement page background</Label>
        <p className="text-xs text-muted-foreground">
          Optional. Separate from the website widget background image.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            id="hosted-bg-upload"
            disabled={backgroundUploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ""
              if (file) void uploadHostedImage(file, "background")
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            disabled={backgroundUploading}
            onClick={() => document.getElementById("hosted-bg-upload")?.click()}
          >
            {backgroundUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Upload background"
            )}
          </Button>
          <Input
            type="text"
            placeholder="https://example.com/background.jpg"
            value={backgroundImageUrl}
            onChange={(e) => setBackgroundImageUrl(e.target.value)}
            className="w-full flex-1"
          />
        </div>
        {backgroundImageUrl ? (
          <div className="h-20 w-full overflow-hidden rounded-md border bg-background">
            <div className="flex justify-end p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs bg-background/80"
                onClick={() => setBackgroundImageUrl("")}
              >
                Remove
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImageUrl}
              alt="Announcement background preview"
              className="h-full w-full object-cover -mt-7"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Content image (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Shown under the announcement message when set. Separate from the
          website widget image. JPEG, PNG, WebP, or GIF (max 5MB).
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            id="hosted-content-upload"
            disabled={contentImageUploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ""
              if (file) void uploadHostedImage(file, "content")
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            disabled={contentImageUploading}
            onClick={() =>
              document.getElementById("hosted-content-upload")?.click()
            }
          >
            {contentImageUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Upload content image"
            )}
          </Button>
          <Input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={contentImageUrl}
            onChange={(e) => setContentImageUrl(e.target.value)}
            className="w-full flex-1"
          />
        </div>
        {contentImageUrl ? (
          <div className="rounded-md border bg-background p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Preview</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setContentImageUrl("")}
              >
                Remove
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={contentImageUrl}
              alt="Content image preview"
              className="max-h-40 max-w-full object-contain"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hosted-youtube">YouTube video link (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Shown below the announcement card. Accepts watch, share, Shorts, or
          embed links. Separate from the website widget video.
        </p>
        <Input
          id="hosted-youtube"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="w-full"
        />
        {parseYoutubeVideoId(youtubeUrl) ? (
          <div className="rounded-md border bg-background p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Video preview</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setYoutubeUrl("")}
              >
                Remove
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={youtubeThumbnailUrl(parseYoutubeVideoId(youtubeUrl)!)}
              alt="YouTube video thumbnail"
              className="max-h-40 max-w-full object-contain"
            />
          </div>
        ) : youtubeUrl.trim() ? (
          <p className="text-xs text-destructive">
            This does not look like a valid YouTube link.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hosted-intro">Short intro (optional)</Label>
        <Textarea
          id="hosted-intro"
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          placeholder="Welcome — see our latest update below."
          rows={2}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hosted-footer">Page footer text (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Shown at the bottom of your announcement page. Use for hours,
          contact info, or any message you want visitors to see.
        </p>
        <Textarea
          id="hosted-footer"
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          placeholder="Open Sundays · All welcome"
          rows={3}
          maxLength={1000}
        />
      </div>

      {companyWebsiteLink ? (
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Label htmlFor="hosted-show-website">
              Use website link on the footer
            </Label>
            <p className="text-xs text-muted-foreground">
              When on, shows &quot;Visit website&quot; under the footer text,
              linking to{" "}
              <span className="break-all font-mono">{companyWebsiteLink}</span>
              .
            </p>
          </div>
          <Switch
            id="hosted-show-website"
            checked={showWebsiteLink}
            onCheckedChange={setShowWebsiteLink}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="hosted-enabled">Publish hosted page</Label>
          <p className="text-xs text-muted-foreground">
            When on, your page is public at your link.
          </p>
        </div>
        <Switch
          id="hosted-enabled"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>

      {enabled && publicUrls && (
        <div className="space-y-2 text-sm">
          <p className="font-medium">Your links</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {publicUrls.subdomain}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyUrl(publicUrls.subdomain)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a
                href={publicUrls.subdomain}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open
              </a>
            </Button>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className={
          saveButtonFullWidth
            ? "w-full !bg-amber-600 hover:!bg-amber-700 !text-white"
            : "w-full sm:w-auto"
        }
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          saveLabel
        )}
      </Button>
    </div>
  )
}
