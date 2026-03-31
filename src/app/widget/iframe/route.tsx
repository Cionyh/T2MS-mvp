import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>T2MS Widget</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .error {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      color: #d32f2f;
    }
  </style>
</head>
<body>
  <div class="error">
    <h2>Widget Error</h2>
    <p>Missing clientId parameter. Please provide ?clientId=YOUR_CLIENT_ID</p>
  </div>
</body>
</html>`,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
            "Content-Security-Policy": "frame-ancestors *",
          },
        }
      );
    }

    // Fetch client and message data
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        defaultType: true,
        defaultBgColor: true,
        defaultTextColor: true,
        defaultFont: true,
        defaultDismissAfter: true,
        pinned: true,
        widgetConfig: true,
      },
    });

    if (!client) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>T2MS Widget</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .error {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      color: #d32f2f;
    }
  </style>
</head>
<body>
  <div class="error">
    <h2>Widget Error</h2>
    <p>Client not found. Please check your client ID.</p>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: {
            "Content-Type": "text/html",
            "Content-Security-Policy": "frame-ancestors *",
          },
        }
      );
    }

    // Fetch latest message
    const latestMessage = await prisma.message.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      select: {
        content: true,
        createdAt: true,
      },
    });

    const messageData = {
      content: latestMessage?.content || "No messages available for this client.",
      type: client.defaultType || "banner",
      bgColor: client.defaultBgColor || "#222",
      textColor: client.defaultTextColor || "#fff",
      font: client.defaultFont || "sans-serif",
      dismissAfter: client.defaultDismissAfter || 5000,
      pinned: client.pinned || false,
      widgetConfig: client.widgetConfig || {},
    };

    // Get API base URL from request
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "www.t2ms.biz";
    const apiBase = `${protocol}://${host}`;

    // Generate HTML with embedded widget
    const html = generateWidgetHTML(clientId, messageData, apiBase);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": "frame-ancestors *",
        "Cache-Control": "public, max-age=60, s-maxage=300", // Cache for 1 min, CDN for 5 min
      },
    });
  } catch (err) {
    console.error("❌ Error in iframe endpoint:", err);
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>T2MS Widget</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .error {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      color: #d32f2f;
    }
  </style>
</head>
<body>
  <div class="error">
    <h2>Widget Error</h2>
    <p>Failed to load widget. Please try again later.</p>
  </div>
</body>
</html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
          "Content-Security-Policy": "frame-ancestors *",
        },
      }
    );
  }
}

// Import the generateWidgetHTML function from display route
// For now, we'll reuse the display route logic by redirecting or copying the function
// Let's import it from a shared utility if it exists, or we'll create a simplified version

// Copy of generateWidgetHTML from display route, adapted for iframe
function generateWidgetHTML(clientId: string, messageData: any, apiBase: string): string {
  const {
    content,
    type,
    bgColor,
    textColor,
    font,
    dismissAfter,
    pinned,
    widgetConfig,
  } = messageData;

  const config = {
    logoUrl: widgetConfig.logoUrl || "",
    companyWebsiteLink: widgetConfig.companyWebsiteLink || "",
    backgroundImageUrl: widgetConfig.backgroundImageUrl || "",
    attachImage: widgetConfig.attachImage || "",
    presetText: widgetConfig.presetText || "",
    borderStyle: widgetConfig.borderStyle || "solid",
    widgetPosition: widgetConfig.widgetPosition || "top-right",
    animationType: widgetConfig.animationType || "fade",
    animationDuration: widgetConfig.animationDuration || 300,
    fontSize: widgetConfig.fontSize || 14,
    mobileFontSize: widgetConfig.mobileFontSize,
  };

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getWidgetHTML() {
    const baseContainerStyle: Record<string, string | undefined> = {
      position: "fixed",
      zIndex: "999999",
      fontFamily: font || "Arial, sans-serif",
      fontSize: `${config.fontSize}px`,
      backgroundColor: bgColor || "#fff",
      color: textColor || "#000",
      boxSizing: "border-box",
      border: config.borderStyle !== "none" ? `1px ${config.borderStyle} #e5e7eb` : "none",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      opacity: "1",
      transition: `all ${config.animationDuration}ms ease`,
    };

    let containerStyle: Record<string, string | undefined> = { ...baseContainerStyle };
    let contentHTML = escapeHtml(content);
    let additionalStyles = "";
    let additionalHTML = "";

    switch (type) {
      case "banner": {
        containerStyle = {
          ...baseContainerStyle,
          width: "100%",
          top: "0",
          left: "0",
          right: "0",
          borderRadius: "0",
          padding: "0",
          margin: "0",
          display: "block",
          boxShadow: "none",
          minHeight: "60px",
        };
        contentHTML = `<div class="t2ms-content">${escapeHtml(content)}</div>`;
        const mobileBannerFontSize =
          typeof config.mobileFontSize === "number"
            ? config.mobileFontSize
            : Math.max(config.fontSize, 15);
        const popupMobileFontSize =
          typeof config.mobileFontSize === "number"
            ? config.mobileFontSize
            : Math.max(config.fontSize, 13);
        additionalStyles = `
    .t2ms-widget-container[data-type="banner"] {
      height: 60px;
      line-height: 60px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .t2ms-widget-container[data-type="banner"] .t2ms-content {
      display: block;
      padding: 0 80px;
      height: 60px;
      line-height: 60px;
      font-size: ${config.fontSize}px;
    }
    @media (max-width: 768px) {
      .t2ms-widget-container[data-type="banner"] {
        height: auto;
        min-height: 56px;
        line-height: 1.4;
        white-space: normal;
      }
      .t2ms-widget-container[data-type="banner"] .t2ms-content {
        padding: 14px 52px 14px 16px;
        height: auto;
        min-height: 56px;
        line-height: 1.45;
        font-size: ${mobileBannerFontSize}px;
        white-space: normal;
        overflow: visible;
        text-overflow: clip;
      }
    }`;
        break;
      }

      case "ticker": {
        containerStyle = {
          ...baseContainerStyle,
          width: "100%",
          top: "0",
          left: "0",
          right: "0",
          borderRadius: "0",
          padding: "0",
          margin: "0",
          display: "block",
          overflow: "hidden",
          whiteSpace: "nowrap" as const,
          boxShadow: "none",
          minHeight: "60px",
        };
        contentHTML = `<div class="t2ms-content">${escapeHtml(content)}</div>`;
        additionalStyles = `
    @keyframes t2ms-ticker-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-100%); }
    }
    .t2ms-widget-container[data-type="ticker"] {
      height: 60px;
    }
    .t2ms-widget-container[data-type="ticker"] .t2ms-content {
      display: inline-block;
      padding-left: 100%;
      padding-right: 80px;
      animation: t2ms-ticker-scroll ${config.animationDuration * 20}ms linear infinite;
      font-size: ${config.fontSize + 4}px;
      height: 60px;
      line-height: 60px;
    }
    @media (max-width: 768px) {
      .t2ms-widget-container[data-type="ticker"] {
        height: auto;
        min-height: 50px;
      }
      .t2ms-widget-container[data-type="ticker"] .t2ms-content {
        padding-right: 50px;
        font-size: ${Math.max(config.fontSize + 2, 14)}px;
        height: auto;
        min-height: 50px;
        line-height: 50px;
      }
    }`;
        break;
      }

      case "popup": {
        const position = config.widgetPosition || "top-right";
        const margin = 10;
        let top = "auto";
        let bottom = "auto";
        let left = "auto";
        let right = "auto";
        let transform = "";

        if (position.includes("top")) {
          top = `${margin}px`;
        } else if (position.includes("bottom")) {
          bottom = `${margin}px`;
        } else {
          top = "50%";
          transform = "translateY(-50%)";
        }

        if (position.includes("left")) {
          left = `${margin}px`;
        } else if (position.includes("right")) {
          right = `${margin}px`;
        } else if (position.includes("center")) {
          left = "50%";
          transform = transform ? `${transform} translateX(-50%)` : "translateX(-50%)";
        }

        containerStyle = {
          ...baseContainerStyle,
          width: "auto",
          maxWidth: "90%",
          minWidth: "280px",
          top,
          bottom,
          left,
          right,
          transform: transform || undefined,
          padding: "16px",
          borderRadius: "8px",
        };
        additionalStyles = `
    .t2ms-widget-container[data-type="popup"] .t2ms-content {
      font-size: ${config.fontSize}px;
      line-height: 1.4;
      width: 100%;
    }
    @media (max-width: 768px) {
      .t2ms-widget-container[data-type="popup"] {
        min-width: calc(100vw - 32px) !important;
        max-width: calc(100vw - 32px) !important;
        width: calc(100vw - 32px) !important;
        left: 16px !important;
        right: 16px !important;
        top: auto !important;
        bottom: 16px !important;
        transform: none !important;
        padding: 12px !important;
      }
      .t2ms-widget-container[data-type="popup"] .t2ms-content {
        font-size: ${popupMobileFontSize}px;
      }
    }`;
        
        if (config.companyWebsiteLink) {
          contentHTML = `<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;"><div class="t2ms-content">${escapeHtml(content)}</div><a href="${config.companyWebsiteLink}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-size: 14px; display: inline-block; word-break: break-word; opacity: 0.8; transition: opacity 0.2s ease;">${escapeHtml(config.companyWebsiteLink)}</a></div>`;
        } else {
          contentHTML = `<div class="t2ms-content">${escapeHtml(content)}</div>`;
        }
        break;
      }

      case "fullscreen": {
        containerStyle = {
          ...baseContainerStyle,
          top: "0",
          left: "0",
          width: "100%",
          height: "100vh",
          borderRadius: "0",
          padding: "0",
          display: "flex",
          flexDirection: "column" as const,
          justifyContent: "center",
          alignItems: "center",
        };
        
        let fullscreenContent = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh; padding: 20px; box-sizing: border-box; overflow-y: auto;">`;
        
        if (config.presetText) {
          fullscreenContent += `<div style="font-size: ${config.fontSize + 4}px; font-weight: 500; color: ${textColor || "#000"}; text-align: center; margin-bottom: 20px; max-width: min(480px, 80vw); line-height: 1.5; padding: 15px;">${escapeHtml(config.presetText)}</div>`;
        }
        
        if (config.attachImage) {
          fullscreenContent += `<div style="margin-bottom: 20px; text-align: center; max-width: min(384px, 70vw);"><img src="${config.attachImage}" style="max-width: 100%; max-height: 40vh; object-fit: contain; display: block; margin: 0 auto;" alt="Widget Image" /></div>`;
        }
        
        fullscreenContent += `<div class="t2ms-content" style="font-size: ${config.fontSize + 10}px; line-height: 1.5; max-width: 85vw; text-align: center; padding: 20px; margin-bottom: 20px;">${escapeHtml(content)}</div>`;
        additionalStyles += `
    @media (max-width: 768px) {
      .t2ms-widget-container[data-type="fullscreen"] .t2ms-content {
        font-size: ${Math.max(config.fontSize + 6, 18)}px !important;
        padding: 16px !important;
        max-width: 95vw !important;
      }
      .t2ms-widget-container[data-type="fullscreen"] > div {
        padding: 16px !important;
      }
    }`;
        fullscreenContent += `</div>`;
        
        contentHTML = fullscreenContent;
        additionalStyles = `
    body {
      overflow: hidden;
    }`;
        break;
      }

      case "modal": {
        containerStyle = {
          ...baseContainerStyle,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "auto",
          maxWidth: "90vw",
          padding: "32px 40px",
          paddingRight: "56px",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column" as const,
          justifyContent: "center",
          alignItems: "center",
        };
        additionalStyles = `
    body {
      overflow: hidden;
    }
    .t2ms-widget-container[data-type="modal"] .t2ms-content {
      font-size: ${config.fontSize + 4}px;
      line-height: 1.5;
      max-width: min(480px, 90vw);
    }
    @media (max-width: 768px) {
      .t2ms-widget-container[data-type="modal"] {
        max-width: calc(100vw - 32px) !important;
        width: calc(100vw - 32px) !important;
        padding: 20px 24px !important;
        padding-right: 40px !important;
      }
      .t2ms-widget-container[data-type="modal"] .t2ms-content {
        font-size: ${Math.max(config.fontSize + 2, 15)}px;
        max-width: 100%;
      }
    }`;
        break;
      }

      default: {
        containerStyle = {
          ...baseContainerStyle,
          top: "20px",
          right: "20px",
          padding: "16px",
          borderRadius: "8px",
        };
        contentHTML = `<div class="t2ms-content">${escapeHtml(content)}</div>`;
      }
    }

    if (config.logoUrl && ["popup", "fullscreen", "modal"].includes(type)) {
      additionalHTML += `<div class="t2ms-logo-container" style="position: absolute; top: 8px; left: 12px; z-index: 10; display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(1px);"><img src="${config.logoUrl}" style="max-width: 32px; max-height: 32px; width: auto; height: auto; object-fit: contain; border-radius: 50%;" alt="Logo" /></div>`;
      additionalStyles += `
    @media (max-width: 768px) {
      .t2ms-logo-container {
        width: 40px !important;
        height: 40px !important;
        top: 6px !important;
        left: 8px !important;
      }
      .t2ms-logo-container img {
        max-width: 24px !important;
        max-height: 24px !important;
      }
    }`;
    }

    if (config.companyWebsiteLink && !["ticker", "banner", "popup"].includes(type)) {
      additionalHTML += `<div style="margin-top: 8px; text-align: center;"><a href="${config.companyWebsiteLink}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-size: 14px; word-break: break-all; display: inline-block; max-width: 100%; opacity: 0.8; transition: opacity 0.2s ease;">${escapeHtml(config.companyWebsiteLink)}</a></div>`;
    }

    if (config.companyWebsiteLink && (type === "banner" || type === "ticker")) {
      additionalHTML += `<div style="width: 100%; text-align: center; padding: 8px 0; background-color: #f9f9f9;"><a href="${config.companyWebsiteLink}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-size: 14px; display: inline-block; opacity: 0.8; transition: opacity 0.2s ease; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(config.companyWebsiteLink)}</a></div>`;
    }

    const styleString = Object.entries(containerStyle)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
      .join("; ");

    return { styleString, contentHTML, additionalStyles, additionalHTML };
  }

  const { styleString, contentHTML: finalContentHTML, additionalStyles, additionalHTML } = getWidgetHTML();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>T2MS Widget</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: ${font || "Arial, sans-serif"};
      background: transparent;
      overflow: hidden;
    }
    
    .t2ms-widget-container {
      ${styleString}
    }
    
    .t2ms-content {
      flex: 1;
      line-height: 1.5;
      word-wrap: break-word;
    }
    
    .t2ms-close {
      position: absolute;
      top: 8px;
      right: 12px;
      background: none;
      border: none;
      color: ${textColor || "#000"};
      font-size: 1.5em;
      line-height: 1;
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 0.2s, transform 0.2s, color 0.2s;
      padding: 4px 8px;
    }
    
    .t2ms-close:hover {
      opacity: 1;
      transform: scale(1.05);
      color: #ff5555;
    }
    
    @media (max-width: 768px) {
      .t2ms-close {
        top: 6px;
        right: 8px;
        font-size: 1.3em;
        padding: 6px;
        min-width: 32px;
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    ${additionalStyles}
    
    ${config.backgroundImageUrl ? `
    .t2ms-widget-container {
      background-image: url("${config.backgroundImageUrl}");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    ` : ""}
  </style>
</head>
<body>
  <div id="t2ms-widget" class="t2ms-widget-container" data-type="${type}" role="${type === "fullscreen" || type === "modal" ? "dialog" : "status"}" ${type === "fullscreen" || type === "modal" ? 'aria-modal="true"' : 'aria-live="polite"'}>
    ${finalContentHTML}
    ${pinned ? `<button class="t2ms-close" aria-label="Close notification" title="Close" onclick="document.getElementById('t2ms-widget').style.display = 'none'">×</button>` : ""}
    ${additionalHTML}
  </div>
  
  <script>
    (function() {
      const clientId = "${clientId}";
      const API_BASE = "${apiBase}";
      const interval = 15000;
      let lastMessageContent = null;
      let lastPinnedState = ${pinned};
      
      window.addEventListener('message', function(event) {
        if (event.data === 't2ms-close') {
          document.getElementById('t2ms-widget').style.display = 'none';
        }
      });
      
      async function fetchMessage() {
        try {
          const res = await fetch(\`\${API_BASE}/api/message/\${clientId}\`);
          if (!res.ok) return;
          
          const data = await res.json();
          const { content, pinned: newPinned } = data;
          
          const contentChanged = content !== lastMessageContent;
          const pinnedChanged = newPinned !== lastPinnedState;
          
          lastMessageContent = content;
          lastPinnedState = newPinned;
          
          if (contentChanged || pinnedChanged) {
            const widget = document.getElementById('t2ms-widget');
            const contentDiv = widget.querySelector('.t2ms-content');
            
            if (newPinned && content) {
              contentDiv.textContent = content;
              widget.style.display = '';
            } else {
              widget.style.display = 'none';
            }
          }
        } catch (err) {
          console.error("T2MS widget fetch error:", err);
        }
      }
      
      fetchMessage();
      setInterval(fetchMessage, interval);
    })();
  </script>
</body>
</html>`;
}

