import type { HostedPageData } from "./types"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function renderHostedPageHtml(
  data: HostedPageData,
  apiBase: string
): string {
  const {
    clientId,
    name,
    hostedIntroText,
    messageContent,
    defaultBgColor,
    defaultTextColor,
    defaultFont,
    widgetConfig,
    isStaticDemo,
  } = data

  const logoUrl = widgetConfig.logoUrl || ""
  const backgroundImageUrl = widgetConfig.backgroundImageUrl || ""
  const attachImage = widgetConfig.attachImage || ""
  const presetText = widgetConfig.presetText || ""
  const mainWebsite = widgetConfig.companyWebsiteLink || ""
  const fontSize = widgetConfig.fontSize || 18

  const introBlock = hostedIntroText
    ? `<p class="t2ms-intro">${escapeHtml(hostedIntroText)}</p>`
    : presetText
      ? `<p class="t2ms-intro">${escapeHtml(presetText)}</p>`
      : ""

  const logoImg = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(name)} logo" class="t2ms-logo" />`
    : ""

  const headerBlock = `<header class="t2ms-header">${logoImg}<h1 class="t2ms-title">${escapeHtml(name)}</h1></header>`

  const attachBlock = attachImage
    ? `<div class="t2ms-attach"><img src="${escapeHtml(attachImage)}" alt="" /></div>`
    : ""

  const returnLinkBlock = mainWebsite
    ? `<footer class="t2ms-footer"><a class="t2ms-return" href="${escapeHtml(mainWebsite)}" target="_blank" rel="noopener noreferrer">Return to Main Website</a></footer>`
    : ""

  const bgStyle = backgroundImageUrl
    ? `background-image: linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("${backgroundImageUrl}"); background-size: cover; background-position: center;`
    : `background-color: ${defaultBgColor};`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(name)} — Live Announcements</title>
  <meta name="robots" content="index, follow" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: ${defaultFont}, system-ui, -apple-system, sans-serif;
      color: ${defaultTextColor};
      ${bgStyle}
      display: flex;
      flex-direction: column;
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
    .t2ms-logo {
      max-width: 80px;
      max-height: 64px;
      object-fit: contain;
      flex-shrink: 0;
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
    .t2ms-message {
      font-size: ${fontSize + 4}px;
      line-height: 1.5;
      font-weight: 600;
    }
    .t2ms-attach img {
      max-width: min(100%, 320px);
      max-height: 240px;
      object-fit: contain;
      border-radius: 8px;
      margin-top: 16px;
    }
    .t2ms-footer {
      margin-top: auto;
      padding: 24px 16px;
      width: 100%;
      text-align: center;
    }
    .t2ms-return {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.15);
      color: inherit;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      border: 1px solid rgba(255, 255, 255, 0.25);
      transition: background 0.2s;
    }
    .t2ms-return:hover { background: rgba(255, 255, 255, 0.25); }
    .t2ms-powered {
      margin-top: 12px;
      font-size: 0.75rem;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <main class="t2ms-page">
    ${headerBlock}
    ${introBlock}
    <section class="t2ms-announcement" aria-live="polite">
      <div id="t2ms-message" class="t2ms-message">${escapeHtml(messageContent)}</div>
      ${attachBlock}
    </section>
  </main>
  ${returnLinkBlock}
  <p class="t2ms-powered">Powered by Text2MySite™${isStaticDemo ? " · Demo page" : ""}</p>
  ${
    isStaticDemo
      ? ""
      : `<script>
    (function() {
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
              if (el) el.textContent = data.content;
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
