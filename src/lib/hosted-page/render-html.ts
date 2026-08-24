import type { HostedPageData } from "./types"
import { normalizeHostedTheme, type HostedThemeId } from "./themes"
import { youtubeEmbedHtml } from "@/lib/youtube-embed"
import {
  formatSmsMessageHtml,
  FORMAT_SMS_MESSAGE_CLIENT_JS,
} from "@/lib/sms-format"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatPlainTextBlock(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br />")
}

/** Ensure href is a safe absolute-or-protocol-relative http(s) URL for the public page. */
function normalizeWebsiteHref(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`
    const url = new URL(withProtocol)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.toString()
  } catch {
    return null
  }
}

function themeStyles(
  theme: HostedThemeId,
  defaultBgColor: string,
  defaultTextColor: string,
  defaultFont: string,
  fontSize: number,
  backgroundImageUrl: string
): string {
  const brandBg = defaultBgColor || "#1a1a2e"
  const brandText = defaultTextColor || "#ffffff"
  const fontStack = `${defaultFont}, system-ui, -apple-system, sans-serif`
  const msgSize = fontSize + 4

  const bgImage = backgroundImageUrl
    ? `background-image: linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("${backgroundImageUrl}"); background-size: cover; background-position: center;`
    : ""

  // Shared base
  const base = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: ${fontStack};
      display: flex;
      flex-direction: column;
    }
    .t2ms-logo {
      max-width: 80px;
      max-height: 64px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .t2ms-attach img {
      max-width: min(100%, 320px);
      max-height: 240px;
      object-fit: contain;
      border-radius: 8px;
      margin-top: 16px;
    }
    .t2ms-youtube {
      width: 100%;
      max-width: min(720px, 100%);
      aspect-ratio: 16 / 9;
      margin: 0 auto 20px;
      border-radius: 12px;
      overflow: hidden;
      background: #000;
      flex-shrink: 0;
    }
    .t2ms-youtube iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }
    .t2ms-message {
      font-size: ${msgSize}px;
      line-height: 1.5;
      font-weight: 600;
    }
    .t2ms-message strong {
      font-weight: 800;
    }
    .t2ms-message em {
      font-style: italic;
      font-weight: 500;
    }
    .t2ms-powered {
      font-size: 0.75rem;
      opacity: 0.55;
      text-align: center;
      padding: 0 16px 20px;
    }
    .t2ms-footer-link {
      display: inline-block;
      margin-top: 10px;
      font-size: 0.95rem;
      font-weight: 500;
      text-decoration: underline;
      text-underline-offset: 3px;
      color: inherit;
      opacity: 0.9;
    }
    .t2ms-footer-link:hover {
      opacity: 1;
    }
  `

  if (theme === "light") {
    return (
      base +
      `
      body {
        color: #0f172a;
        background-color: #f1f5f9;
        ${bgImage || `background: linear-gradient(165deg, #f8fafc 0%, #e2e8f0 100%);`}
      }
      .t2ms-page {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px 24px;
        max-width: 640px;
        margin: 0 auto;
        width: 100%;
        text-align: center;
      }
      .t2ms-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
        width: 100%;
      }
      .t2ms-logo {
        max-width: 96px;
        max-height: 72px;
        border-radius: 12px;
        box-shadow: 0 4px 14px rgba(15,23,42,0.08);
      }
      .t2ms-title {
        font-size: clamp(1.6rem, 4vw, 2.1rem);
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.02em;
      }
      .t2ms-intro {
        font-size: 1rem;
        color: #475569;
        margin-bottom: 28px;
        line-height: 1.55;
        max-width: 32rem;
      }
      .t2ms-announcement {
        width: 100%;
        padding: 28px 24px;
        border-radius: 16px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06);
        margin-bottom: 20px;
      }
      .t2ms-message { color: #0f172a; }
      .t2ms-footer {
        margin-top: auto;
        padding: 20px 16px 8px;
        width: 100%;
        text-align: center;
      }
      .t2ms-footer-text {
        font-size: 0.95rem;
        line-height: 1.6;
        color: #64748b;
        max-width: 32rem;
        margin: 0 auto;
      }
      .t2ms-powered { color: #94a3b8; }
    `
    )
  }

  if (theme === "spotlight") {
    return (
      base +
      `
      body {
        color: #f8fafc;
        ${
          bgImage ||
          `background-color: #0b1020;
        background-image:
          radial-gradient(ellipse 80% 50% at 50% -20%, ${brandBg}88, transparent 55%),
          radial-gradient(ellipse 60% 40% at 100% 100%, #0ea5e933, transparent 45%),
          linear-gradient(180deg, #0b1020 0%, #111827 100%);`
        }
      }
      .t2ms-page {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 16px 28px;
        max-width: 560px;
        margin: 0 auto;
        width: 100%;
        text-align: center;
      }
      .t2ms-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        margin-bottom: 8px;
      }
      .t2ms-logo {
        max-width: 88px;
        max-height: 72px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.15);
        padding: 4px;
        background: rgba(0,0,0,0.2);
      }
      .t2ms-title {
        font-size: clamp(1.75rem, 5vw, 2.35rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        text-shadow: 0 2px 20px rgba(0,0,0,0.35);
      }
      .t2ms-intro {
        font-size: 0.98rem;
        opacity: 0.88;
        margin-bottom: 28px;
        line-height: 1.55;
        max-width: 28rem;
      }
      .t2ms-announcement {
        width: 100%;
        padding: 32px 26px;
        border-radius: 20px;
        background: linear-gradient(160deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03));
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.14);
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.45);
        margin-bottom: 24px;
      }
      .t2ms-message {
        font-size: ${msgSize + 2}px;
        font-weight: 650;
      }
      .t2ms-footer {
        margin-top: auto;
        padding: 16px;
        width: 100%;
        text-align: center;
      }
      .t2ms-footer-text {
        font-size: 0.9rem;
        line-height: 1.6;
        opacity: 0.8;
        max-width: 28rem;
        margin: 0 auto;
      }
    `
    )
  }

  if (theme === "banner") {
    return (
      base +
      `
      body {
        color: #111827;
        background-color: #f8fafc;
        ${bgImage}
      }
      .t2ms-header {
        width: 100%;
        background: ${brandBg};
        color: ${brandText};
        padding: 28px 20px 32px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
        box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      }
      .t2ms-header .t2ms-logo {
        max-width: 72px;
        max-height: 56px;
        border-radius: 8px;
        background: rgba(255,255,255,0.1);
        padding: 4px;
      }
      .t2ms-title {
        font-size: clamp(1.5rem, 4vw, 2rem);
        font-weight: 700;
        color: ${brandText};
        text-align: left;
      }
      .t2ms-page {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 28px 16px 24px;
        max-width: 680px;
        margin: 0 auto;
        width: 100%;
        text-align: center;
      }
      .t2ms-intro {
        font-size: 1rem;
        color: #4b5563;
        margin-bottom: 24px;
        line-height: 1.55;
        max-width: 36rem;
      }
      .t2ms-announcement {
        width: 100%;
        padding: 28px 24px;
        border-radius: 12px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-top: 4px solid ${brandBg};
        box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        margin-bottom: 20px;
        text-align: left;
      }
      .t2ms-message {
        color: #111827;
        font-weight: 600;
      }
      .t2ms-footer {
        margin-top: auto;
        padding: 20px 16px 8px;
        width: 100%;
        max-width: 680px;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
      }
      .t2ms-footer-text {
        font-size: 0.95rem;
        line-height: 1.6;
        color: #6b7280;
        max-width: 36rem;
        margin: 0 auto;
      }
      .t2ms-powered { color: #9ca3af; }
    `
    )
  }

  if (theme === "minimal") {
    return (
      base +
      `
      body {
        color: #1c1917;
        background-color: #faf9f7;
        ${bgImage}
      }
      .t2ms-page {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        padding: 48px 24px 32px;
        max-width: 520px;
        margin: 0 auto;
        width: 100%;
        text-align: left;
      }
      .t2ms-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 14px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid ${brandBg};
      }
      .t2ms-logo {
        max-width: 56px;
        max-height: 48px;
      }
      .t2ms-title {
        font-size: clamp(1.4rem, 3.5vw, 1.85rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        color: #1c1917;
      }
      .t2ms-intro {
        font-size: 0.95rem;
        color: #57534e;
        margin-bottom: 28px;
        line-height: 1.6;
      }
      .t2ms-announcement {
        width: 100%;
        padding: 0 0 8px;
        background: transparent;
        border: none;
        margin-bottom: 32px;
      }
      .t2ms-message {
        font-size: ${msgSize + 4}px;
        font-weight: 500;
        line-height: 1.45;
        color: #0c0a09;
        letter-spacing: -0.015em;
      }
      .t2ms-footer {
        margin-top: auto;
        padding: 20px 0 0;
        border-top: 1px solid #e7e5e4;
        width: 100%;
        text-align: left;
      }
      .t2ms-footer-text {
        font-size: 0.875rem;
        line-height: 1.65;
        color: #78716c;
      }
      .t2ms-powered {
        text-align: left;
        max-width: 520px;
        margin: 0 auto;
        padding: 12px 24px 28px;
        color: #a8a29e;
      }
    `
    )
  }

  if (theme === "aurora") {
    return (
      base +
      `
      body {
        color: #ecfeff;
        ${
          bgImage ||
          `background-color: #040c14;
        background-image:
          radial-gradient(ellipse 70% 55% at 15% 20%, #0d948855, transparent 55%),
          radial-gradient(ellipse 55% 45% at 90% 10%, #f59e0b33, transparent 50%),
          radial-gradient(ellipse 60% 50% at 70% 90%, #0284c744, transparent 55%),
          linear-gradient(160deg, #040c14 0%, #0b1a28 50%, #051018 100%);
        background-attachment: fixed;`
        }
      }
      .t2ms-page {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 18px 28px;
        max-width: 580px;
        margin: 0 auto;
        width: 100%;
        text-align: center;
      }
      .t2ms-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        margin-bottom: 6px;
      }
      .t2ms-logo {
        max-width: 92px;
        max-height: 76px;
        border-radius: 18px;
        padding: 6px;
        background: linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 12px 40px rgba(0,0,0,0.35);
      }
      .t2ms-title {
        font-size: clamp(1.7rem, 5vw, 2.4rem);
        font-weight: 750;
        letter-spacing: -0.03em;
        background: linear-gradient(120deg, #ecfeff 0%, #a5f3fc 45%, #fde68a 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
      }
      .t2ms-intro {
        font-size: 1rem;
        color: rgba(236, 254, 255, 0.82);
        margin-bottom: 28px;
        line-height: 1.6;
        max-width: 28rem;
      }
      .t2ms-announcement {
        width: 100%;
        padding: 34px 28px;
        border-radius: 24px;
        background: linear-gradient(165deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04));
        backdrop-filter: blur(18px) saturate(1.2);
        -webkit-backdrop-filter: blur(18px) saturate(1.2);
        border: 1px solid rgba(255,255,255,0.22);
        box-shadow:
          0 0 0 1px rgba(45, 212, 191, 0.12),
          0 30px 60px -20px rgba(0,0,0,0.55),
          inset 0 1px 0 rgba(255,255,255,0.2);
        margin-bottom: 24px;
        position: relative;
      }
      .t2ms-announcement::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(135deg, rgba(45,212,191,0.45), transparent 40%, rgba(245,158,11,0.35));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }
      .t2ms-message {
        font-size: ${msgSize + 2}px;
        font-weight: 650;
        color: #f0fdfa;
        text-shadow: 0 1px 12px rgba(0,0,0,0.25);
      }
      .t2ms-footer {
        margin-top: auto;
        padding: 16px;
        width: 100%;
        text-align: center;
      }
      .t2ms-footer-text {
        font-size: 0.9rem;
        line-height: 1.65;
        color: rgba(207, 250, 254, 0.75);
        max-width: 28rem;
        margin: 0 auto;
      }
      .t2ms-powered { color: rgba(165, 243, 252, 0.45); }
    `
    )
  }

  if (theme === "stage") {
    return (
      base +
      `
      body {
        color: #fafaf9;
        ${
          bgImage ||
          `background-color: #050505;
        background-image:
          radial-gradient(ellipse 50% 40% at 50% 0%, rgba(212,160,23,0.12), transparent 60%),
          radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,0,0,0.9), transparent 50%),
          linear-gradient(180deg, #0c0c0c 0%, #050505 100%);`
        }
      }
      .t2ms-page {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 20px 36px;
        max-width: 640px;
        margin: 0 auto;
        width: 100%;
        text-align: center;
      }
      .t2ms-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        margin-bottom: 8px;
      }
      .t2ms-logo {
        max-width: 100px;
        max-height: 80px;
        filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5));
      }
      .t2ms-title {
        font-size: clamp(1.85rem, 5.5vw, 2.75rem);
        font-weight: 300;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #fafaf9;
      }
      .t2ms-title::after {
        content: "";
        display: block;
        width: 48px;
        height: 2px;
        margin: 16px auto 0;
        background: linear-gradient(90deg, transparent, #d4a017, transparent);
      }
      .t2ms-intro {
        font-size: 0.95rem;
        font-weight: 300;
        letter-spacing: 0.04em;
        color: rgba(250, 250, 249, 0.65);
        margin: 8px 0 36px;
        line-height: 1.7;
        max-width: 26rem;
      }
      .t2ms-announcement {
        width: 100%;
        padding: 40px 32px;
        border-radius: 4px;
        background: linear-gradient(180deg, #121212 0%, #0a0a0a 100%);
        border: 1px solid rgba(212, 160, 23, 0.28);
        box-shadow:
          0 0 0 8px rgba(212, 160, 23, 0.04),
          0 40px 80px -24px rgba(0,0,0,0.8);
        margin-bottom: 28px;
      }
      .t2ms-message {
        font-size: ${msgSize + 6}px;
        font-weight: 400;
        line-height: 1.4;
        letter-spacing: -0.01em;
        color: #fafaf9;
      }
      .t2ms-footer {
        margin-top: auto;
        padding: 20px 16px;
        width: 100%;
        text-align: center;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .t2ms-footer-text {
        font-size: 0.85rem;
        letter-spacing: 0.03em;
        line-height: 1.7;
        color: rgba(250, 250, 249, 0.5);
        max-width: 28rem;
        margin: 0 auto;
      }
      .t2ms-powered {
        color: rgba(212, 160, 23, 0.35);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        font-size: 0.65rem;
      }
    `
    )
  }

  // classic (default)
  return (
    base +
    `
    body {
      color: ${brandText};
      ${bgImage || `background-color: ${brandBg};`}
    }
    .t2ms-page {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px 32px;
      max-width: 720px;
      margin: 0 auto;
      width: 100%;
      text-align: center;
    }
    .t2ms-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;
      width: 100%;
    }
    .t2ms-title {
      font-size: clamp(1.5rem, 4vw, 2rem);
      font-weight: 700;
      margin-bottom: 0;
      line-height: 1.2;
      text-align: left;
    }
    .t2ms-intro {
      font-size: 1rem;
      opacity: 0.9;
      margin-bottom: 24px;
      line-height: 1.5;
      max-width: 36rem;
    }
    .t2ms-announcement {
      width: 100%;
      padding: 24px 20px;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      margin-bottom: 20px;
    }
    .t2ms-footer {
      margin-top: auto;
      padding: 24px 16px;
      width: 100%;
      text-align: center;
    }
    .t2ms-footer-text {
      font-size: 0.95rem;
      line-height: 1.6;
      opacity: 0.95;
      max-width: 36rem;
      margin: 0 auto;
    }
  `
  )
}

export function renderHostedPageHtml(
  data: HostedPageData,
  apiBase: string
): string {
  const {
    clientId,
    name,
    hostedIntroText,
    hostedFooterText,
    messageContent,
    defaultBgColor,
    defaultTextColor,
    defaultFont,
    widgetConfig,
    isStaticDemo,
  } = data

  const theme = normalizeHostedTheme(data.hostedTheme)
  const showLogo = data.hostedShowLogo !== false
  // Announcement page uses dedicated brand assets (not shared with the website widget)
  const logoUrl =
    (data.hostedLogoUrl?.trim() || widgetConfig.logoUrl || "").trim()
  const backgroundImageUrl =
    (data.hostedBackgroundImageUrl?.trim() ||
      widgetConfig.backgroundImageUrl ||
      "").trim()
  // Content image under the message; prefer announcement-specific, fall back to widget attach
  const contentImageUrl =
    (data.hostedContentImageUrl?.trim() ||
      widgetConfig.attachImage ||
      "").trim()
  // Announcement YouTube is independent of the website widget video setting
  const youtubeBlock = youtubeEmbedHtml(data.hostedYoutubeUrl)
  const presetText = widgetConfig.presetText || ""
  const fontSize = widgetConfig.fontSize || 18

  const introBlock = hostedIntroText
    ? `<p class="t2ms-intro">${escapeHtml(hostedIntroText)}</p>`
    : presetText
      ? `<p class="t2ms-intro">${escapeHtml(presetText)}</p>`
      : ""

  const logoImg =
    showLogo && logoUrl
      ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(name)} logo" class="t2ms-logo" />`
      : ""

  // Banner theme: header lives outside the page content column
  const headerBlock = `<header class="t2ms-header">${logoImg}<h1 class="t2ms-title">${escapeHtml(name)}</h1></header>`

  const attachBlock = contentImageUrl
    ? `<div class="t2ms-attach"><img src="${escapeHtml(contentImageUrl)}" alt="" /></div>`
    : ""

  const websiteHref =
    data.hostedShowWebsiteLink && widgetConfig.companyWebsiteLink
      ? normalizeWebsiteHref(widgetConfig.companyWebsiteLink)
      : null
  const websiteLinkBlock = websiteHref
    ? `<a class="t2ms-footer-link" href="${escapeHtml(websiteHref)}" target="_blank" rel="noopener noreferrer">Visit website</a>`
    : ""
  const footerTextInner = hostedFooterText
    ? `<div class="t2ms-footer-text">${formatPlainTextBlock(hostedFooterText)}</div>`
    : ""
  const footerTextBlock =
    footerTextInner || websiteLinkBlock
      ? `<footer class="t2ms-footer">${footerTextInner}${websiteLinkBlock}</footer>`
      : ""

  const css = themeStyles(
    theme,
    defaultBgColor,
    defaultTextColor,
    defaultFont,
    fontSize,
    backgroundImageUrl
  )

  const mainInner =
    theme === "banner"
      ? `${introBlock}
    <section class="t2ms-announcement" aria-live="polite">
      <div id="t2ms-message" class="t2ms-message">${formatSmsMessageHtml(messageContent)}</div>
      ${attachBlock}
    </section>
    ${youtubeBlock}`
      : `${headerBlock}
    ${introBlock}
    <section class="t2ms-announcement" aria-live="polite">
      <div id="t2ms-message" class="t2ms-message">${formatSmsMessageHtml(messageContent)}</div>
      ${attachBlock}
    </section>
    ${youtubeBlock}`

  const bannerHeader = theme === "banner" ? headerBlock : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(name)} — Live Announcements</title>
  <meta name="robots" content="index, follow" />
  <style>${css}</style>
</head>
<body class="t2ms-theme-${theme}">
  ${bannerHeader}
  <main class="t2ms-page">
    ${mainInner}
  </main>
  ${footerTextBlock}
  <p class="t2ms-powered">Powered by Text2MySite™${isStaticDemo ? " · Demo page" : ""}</p>
  ${
    isStaticDemo
      ? ""
      : `<script>
    (function() {
      ${FORMAT_SMS_MESSAGE_CLIENT_JS}
      var clientId = ${JSON.stringify(clientId)};
      var apiBase = ${JSON.stringify(apiBase)};
      var lastContent = ${JSON.stringify(messageContent)};
      function poll() {
        fetch(apiBase + "/api/message/" + clientId)
          .then(function(r) { return r.ok ? r.json() : null; })
          .then(function(data) {
            if (!data || !data.content) return;
            if (data.content !== lastContent) {
              lastContent = data.content;
              var el = document.getElementById("t2ms-message");
              if (el) el.innerHTML = formatSmsMessageHtml(data.content);
            }
          })
          .catch(function() {});
      }
      setInterval(poll, 15000);
    })();
  </script>`
  }
</body>
</html>`
}

export function renderHostedNotFoundHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page not found</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; color: #333; }
    .box { text-align: center; padding: 24px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Announcement page not found</h1>
    <p>This link may be incorrect or the page is not published.</p>
  </div>
</body>
</html>`
}
