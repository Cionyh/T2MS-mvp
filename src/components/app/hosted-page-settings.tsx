"use client"

import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ExternalLink, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { getHostedPageDomain } from "@/lib/hosted-page/constants"
import { slugFromSiteName } from "@/lib/hosted-page/slug"
import {
  HOSTED_THEMES,
  normalizeHostedTheme,
  type HostedThemeId,
} from "@/lib/hosted-page/themes"
import { cn } from "@/lib/utils"

type HostedPageSettingsProps = {
  clientId: string
  siteName: string
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
}: HostedPageSettingsProps) {
  const domain = getHostedPageDomain()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slugInput, setSlugInput] = useState("")
  const [introText, setIntroText] = useState("")
  const [footerText, setFooterText] = useState("")
  const [theme, setTheme] = useState<HostedThemeId>("classic")
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
      setEnabled(data.hostedEnabled ?? false)
      setPublicUrls(data.publicUrls ?? null)
    } catch {
      toast.error("Could not load hosted page settings")
    } finally {
      setLoading(false)
    }
  }, [clientId, siteName])

  useEffect(() => {
    load()
  }, [load])

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
    if (enabled && slugStatus !== "available" && slugInput.trim()) {
      toast.error("Choose an available page name before publishing.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/client/${clientId}/hosted`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostedSlug: slugInput.trim() || null,
          hostedEnabled: enabled,
          hostedIntroText: introText,
          hostedFooterText: footerText,
          hostedTheme: theme,
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
      toast.success("Hosted page settings saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
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
          Share a standalone live page (no widget install required). Uses your
          logo, colors, and latest announcement from {siteName}.
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
        <Label>Page style</Label>
        <p className="text-xs text-muted-foreground">
          Choose how your public announcement page looks. Your logo, brand
          colors, and latest message still apply where the layout supports them.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {HOSTED_THEMES.map((t) => {
            const selected = theme === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  "text-left rounded-lg border p-3 transition-colors",
                  selected
                    ? "border-amber-600 bg-amber-50/80 ring-1 ring-amber-600/40 dark:bg-amber-950/30"
                    : "border-border bg-background hover:border-amber-600/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md border border-black/10 shadow-sm"
                    aria-hidden
                  >
                    <div
                      className="absolute inset-0"
                      style={{ background: t.swatch.bg }}
                    />
                    {t.id === "banner" && (
                      <div
                        className="absolute inset-x-0 top-0 h-4"
                        style={{ background: t.swatch.accent }}
                      />
                    )}
                    <div
                      className={cn(
                        "absolute rounded-sm",
                        t.id === "minimal"
                          ? "inset-x-2 bottom-2 top-5"
                          : "inset-x-2 bottom-2 top-6"
                      )}
                      style={{
                        background: t.swatch.card,
                        border:
                          t.id === "minimal"
                            ? "none"
                            : `1px solid ${t.swatch.accent}33`,
                      }}
                    />
                    <div
                      className="absolute left-2.5 top-1.5 h-1 w-6 rounded-full opacity-90"
                      style={{ background: t.swatch.text }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{t.name}</span>
                      {selected && (
                        <Check className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {t.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
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
          Shown at the bottom of your hosted page. Use this for a website
          link, hours, contact info, or any message you want visitors to see.
        </p>
        <Textarea
          id="hosted-footer"
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          placeholder="Visit us at www.example.com"
          rows={3}
          maxLength={1000}
        />
      </div>

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
        onClick={handleSave}
        disabled={saving}
        className="w-full sm:w-auto"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save hosted page"
        )}
      </Button>
    </div>
  )
}
