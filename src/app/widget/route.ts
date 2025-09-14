import { NextResponse } from "next/server";

export async function GET() {
  const js = `
(async function () {
  if (window.__T2MS_WIDGET_INITIALIZED__) return;
  window.__T2MS_WIDGET_INITIALIZED__ = true;
  window.__T2MS_WIDGET_SHOWN__ = false;

  const script = document.currentScript;
  const clientId = script?.dataset?.clientId;
  const WIDGET_ID = "t2ms-widget";
  const API_BASE = script?.dataset?.api || window.location.origin;
  const FETCH_INTERVAL = 15000; // ms

  if (!clientId) {
    console.error("T2MS widget: Missing data-client-id");
    return;
  }

  // --- Utility Functions ---
  function removeWidget() {
    const existing = document.getElementById(WIDGET_ID);
    if (existing) existing.remove();

    const overlay = document.getElementById(WIDGET_ID + "-overlay");
    if (overlay) overlay.remove();

    if (document.body.dataset.t2msLock === "1") {
      document.body.style.overflow = "";
      delete document.body.dataset.t2msLock;
    }

    if (window.__t2msEscHandler__) {
      window.removeEventListener("keydown", window.__t2msEscHandler__);
      window.__t2msEscHandler__ = null;
    }
  }

  async function fetchMessage() {
    try {
      const res = await fetch(\`\${API_BASE}/api/message/\${clientId}\`);
      if (!res.ok) return;

      const data = await res.json();
      const { content, type, bgColor, textColor, font, dismissAfter, pinned, widgetConfig = {} } = data;

      if (!pinned) {
        removeWidget();
        return;
      }

      if (!content || window.__T2MS_WIDGET_SHOWN__) return;

      renderMessage({ content, type, bgColor, textColor, font, dismissAfter, widgetConfig });
    } catch (err) {
      console.error("T2MS widget fetch error:", err);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Main Renderer ---
  function renderMessage({ content, type, bgColor, textColor, font, dismissAfter, widgetConfig = {} }) {
    if (window.__T2MS_WIDGET_SHOWN__) return;
    window.__T2MS_WIDGET_SHOWN__ = true;

    removeWidget();

    const wrapper = document.createElement("div");
    wrapper.id = WIDGET_ID;
    wrapper.setAttribute("aria-live", "polite");

    if (widgetConfig.customCssClasses) {
      wrapper.className = widgetConfig.customCssClasses;
    }

    wrapper.innerHTML = '<div class="t2ms-content"></div><button class="t2ms-close" aria-label="Close notification">&times;</button>';

    const btn = wrapper.querySelector(".t2ms-close");
    const contentDiv = wrapper.querySelector(".t2ms-content");
    contentDiv.innerHTML = escapeHtml(content);

    // --- Configuration with Defaults ---
    const config = {
      logoUrl: widgetConfig.logoUrl || "",
      companyWebsiteLink: widgetConfig.companyWebsiteLink || "",
      backgroundImageUrl: widgetConfig.backgroundImageUrl || "",
      attachImage: widgetConfig.attachImage || "",
      presetText: widgetConfig.presetText || "",
      borderStyle: widgetConfig.borderStyle !== "none" ? widgetConfig.borderStyle : "none",
      widgetPosition: widgetConfig.widgetPosition || "top-right",
      animationType: widgetConfig.animationType || "fade",
      animationDuration: Math.max(100, Number(widgetConfig.animationDuration) || 300),
      fontSize: Math.max(12, Math.min(24, Number(widgetConfig.fontSize) || 14)),
    };

    // --- Apply Base Styles ---
    Object.assign(wrapper.style, {
      position: "fixed",
      zIndex: "999999",
      fontFamily: font || "Arial, sans-serif",
      backgroundColor: bgColor || "#fff",
      color: textColor || "#000",
      borderRadius: "8px",
      cursor: "default",
      opacity: "0",
      transition: \`opacity \${config.animationDuration}ms ease\`,
      boxSizing: "border-box",
      overflow: "hidden",
    });

    if (config.borderStyle !== "none") {
      wrapper.style.border = \`1px \${config.borderStyle} #e5e7eb\`;
    }

    if (config.backgroundImageUrl) {
      wrapper.style.backgroundImage = \`url("\${config.backgroundImageUrl}")\`;
      wrapper.style.backgroundSize = "cover";
      wrapper.style.backgroundPosition = "center";
      wrapper.style.backgroundRepeat = "no-repeat";
    }

    // --- Close Button Styling ---
    Object.assign(btn.style, {
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "none",
      border: "none",
      color: textColor || "#000",
      fontSize: "1.5em",
      lineHeight: "1",
      cursor: "pointer",
      opacity: "0.8",
      transition: "color 0.2s, transform 0.2s",
      zIndex: "2",
    });

    btn.onmouseover = () => { btn.style.color = "#f00"; btn.style.transform = "scale(1.1)"; };
    btn.onmouseout = () => { btn.style.color = textColor || "#000"; btn.style.transform = "none"; };
    btn.onclick = removeWidget;

    // --- Positioning Logic ---
    function applyPosition(type) {
      const pos = config.widgetPosition;
      const margin = 12;

      wrapper.style.top = "";
      wrapper.style.bottom = "";
      wrapper.style.left = "";
      wrapper.style.right = "";
      wrapper.style.transform = "";

      if (type === "banner" || type === "ticker") {
        wrapper.style.left = "0";
        wrapper.style.width = "100%";
        if (pos.includes("bottom")) {
          wrapper.style.bottom = "-100px";
        } else {
          wrapper.style.top = "-100px";
        }
      } else if (type === "popup" || type === "modal") {
        if (pos.includes("top")) {
          wrapper.style.top = "\${margin}px";
        } else if (pos.includes("bottom")) {
          wrapper.style.bottom = "\${margin}px";
        } else {
          wrapper.style.top = "50%";
          wrapper.style.transform = "translateY(-50%)";
        }

        if (pos.includes("left")) {
          wrapper.style.left = "\${margin}px";
        } else if (pos.includes("right")) {
          wrapper.style.right = "\${margin}px";
        } else if (pos.includes("center")) {
          wrapper.style.left = "50%";
          wrapper.style.transform += " translateX(-50%)";
        }
      } else {
        wrapper.style.top = "20px";
        wrapper.style.right = "20px";
      }
    }

    // --- Add Logo Helper ---
    function addLogo(container) {
      if (!config.logoUrl) return;

      const logoImg = document.createElement("img");
      logoImg.src = config.logoUrl;
      logoImg.alt = "Brand Logo";
      logoImg.style.cssText = \`
        width: 40px;
        height: 40px;
        object-fit: contain;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      \`;

      const logoWrap = document.createElement("div");
      logoWrap.style.cssText = \`
        position: absolute;
        top: 10px;
        left: 12px;
        z-index: 2;
      \`;
      logoWrap.appendChild(logoImg);
      container.appendChild(logoWrap);
    }

    // --- Add Link Helper ---
    function addCompanyLink(container, textAlign = "center") {
      if (!config.companyWebsiteLink) return;

      const link = document.createElement("a");
      link.href = config.companyWebsiteLink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = new URL(config.companyWebsiteLink).hostname;
      link.style.cssText = \`
        display: block;
        margin-top: 12px;
        font-size: 14px;
        color: #3b82f6;
        text-decoration: underline;
        text-align: \${textAlign};
        word-break: break-word;
        opacity: 0.85;
        transition: opacity 0.2s;
      \`;
      link.onmouseenter = () => link.style.opacity = "1";
      link.onmouseleave = () => link.style.opacity = "0.85";

      container.appendChild(link);
    }

    // --- Animation Starter ---
    function fadeIn() {
      requestAnimationFrame(() => {
        wrapper.style.transition = \`all \${config.animationDuration}ms ease\`;
        wrapper.style.opacity = "1";
      });
    }

    // --- Widget Type Handlers ---
    switch (type) {
      case "banner": {
        wrapper.setAttribute("role", "status");
        Object.assign(wrapper.style, {
          height: "60px",
          top: "0",
          borderRadius: "0",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          fontWeight: "500",
          fontSize: "\${config.fontSize}px",
          display: "flex",
          alignItems: "center",
        });

        contentDiv.style.cssText = \`
          flex: 1;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 120px;
          font-size: \${config.fontSize}px;
          line-height: 60px;
        \`;

        // Add logo and link
        addLogo(wrapper);
        if (config.companyWebsiteLink) {
          const link = document.createElement("a");
          link.href = config.companyWebsiteLink;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = new URL(config.companyWebsiteLink).hostname;
          link.style.cssText = \`
            position: absolute;
            top: 18px;
            right: 16px;
            font-size: 14px;
            color: #3b82f6;
            text-decoration: underline;
            max-width: 160px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            z-index: 2;
          \`;
          wrapper.appendChild(link);
        }

        document.body.appendChild(wrapper);
        requestAnimationFrame(() => {
          wrapper.style.top = "0";
          fadeIn();
        });
        break;
      }

      case "ticker": {
        wrapper.setAttribute("role", "status");
        Object.assign(wrapper.style, {
          height: "60px",
          top: "0",
          borderRadius: "0",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          fontWeight: "500",
          fontSize: "\${config.fontSize + 4}px",
          display: "block",
        });

        const scrollText = document.createElement("div");
        scrollText.className = "t2ms-ticker-text";
        scrollText.innerHTML = escapeHtml(content);
        scrollText.style.cssText = \`
          display: inline-block;
          padding-left: 100%;
          white-space: nowrap;
          animation: t2ms-ticker-scroll \${config.animationDuration * 20}ms linear infinite;
          line-height: 60px;
          height: 60px;
          font-weight: 500;
        \`;

        const inner = document.createElement("div");
        inner.style.cssText = "width: 100%; overflow: hidden;";
        inner.appendChild(scrollText);
        wrapper.appendChild(inner);

        // Inject animation keyframes
        if (!document.head.querySelector("#t2ms-ticker-style")) {
          const style = document.createElement("style");
          style.id = "t2ms-ticker-style";
          style.textContent = \`
            @keyframes t2ms-ticker-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-100%); }
            }
          \`;
          document.head.appendChild(style);
        }

        addLogo(wrapper);
        if (config.companyWebsiteLink) {
          const link = document.createElement("a");
          link.href = config.companyWebsiteLink;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = new URL(config.companyWebsiteLink).hostname;
          link.style.cssText = \`
            position: absolute;
            top: 18px;
            right: 16px;
            font-size: 14px;
            color: #3b82f6;
            text-decoration: underline;
            max-width: 160px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            z-index: 2;
          \`;
          wrapper.appendChild(link);
        }

        document.body.appendChild(wrapper);
        requestAnimationFrame(() => {
          wrapper.style.top = "0";
          fadeIn();
        });
        break;
      }

      case "popup": {
        wrapper.setAttribute("role", "alert");
        Object.assign(wrapper.style, {
          width: "320px",
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "20px",
          fontSize: "\${config.fontSize}px",
          lineHeight: "1.5",
        });

        // Flex layout to avoid overlap
        const flexBox = document.createElement("div");
        flexBox.style.cssText = "display: flex; align-items: flex-start; gap: 12px; width: 100%;";

        addLogo(flexBox);

        const textWrap = document.createElement("div");
        textWrap.style.cssText = "flex: 1; min-width: 0;";
        textWrap.appendChild(contentDiv);
        flexBox.appendChild(textWrap);

        wrapper.appendChild(flexBox);

        if (config.companyWebsiteLink) {
          addCompanyLink(wrapper, "center");
        }

        wrapper.appendChild(btn);
        applyPosition("popup");
        document.body.appendChild(wrapper);

        fadeIn();
        break;
      }

      case "fullscreen": {
        wrapper.setAttribute("role", "dialog");
        wrapper.setAttribute("aria-modal", "true");

        const container = document.createElement("div");
        container.style.cssText = \`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100vh;
          padding: 20px;
          box-sizing: border-box;
          text-align: center;
        \`;

        if (config.presetText) {
          const pText = document.createElement("div");
          pText.textContent = config.presetText;
          pText.style.cssText = \`
            font-size: \${config.fontSize + 6}px;
            font-weight: 600;
            color: \${textColor || "#000"};
            margin-bottom: 20px;
            max-width: 480px;
          \`;
          container.appendChild(pText);
        }

        if (config.attachImage) {
          const img = document.createElement("img");
          img.src = config.attachImage;
          img.style.cssText = \`
            max-width: 100%;
            max-height: 40vh;
            object-fit: contain;
            margin-bottom: 20px;
          \`;
          container.appendChild(img);
        }

        contentDiv.style.cssText = \`
          font-size: \${config.fontSize + 8}px;
          font-weight: 500;
          max-width: 520px;
          line-height: 1.6;
        \`;
        container.appendChild(contentDiv);

        if (config.companyWebsiteLink) {
          addCompanyLink(container, "center");
        }

        Object.assign(wrapper.style, {
          top: "0",
          left: "0",
          width: "100%",
          height: "100vh",
          borderRadius: "0",
          padding: "0",
          backgroundColor: "rgba(0,0,0,0.05)",
        });

        wrapper.appendChild(container);
        document.body.appendChild(wrapper);

        document.body.style.overflow = "hidden";
        document.body.dataset.t2msLock = "1";

        fadeIn();

        window.__t2msEscHandler__ = (e) => e.key === "Escape" && removeWidget();
        window.addEventListener("keydown", window.__t2msEscHandler__);

        break;
      }

      case "modal": {
        wrapper.setAttribute("role", "dialog");
        wrapper.setAttribute("aria-modal", "true");

        const overlay = document.createElement("div");
        overlay.id = WIDGET_ID + "-overlay";
        Object.assign(overlay.style, {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: "999998",
          opacity: "0",
          transition: \`opacity \${config.animationDuration}ms ease\`,
        });

        overlay.onclick = removeWidget;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => { overlay.style.opacity = "1"; });

        Object.assign(wrapper.style, {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0.9)",
          width: "90%",
          maxWidth: "400px",
          padding: "32px",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          textAlign: "center",
        });

        contentDiv.style.cssText = \`
          font-size: \${config.fontSize + 4}px;
          line-height: 1.5;
          max-width: 100%;
        \`;

        wrapper.appendChild(contentDiv);
        wrapper.appendChild(btn);

        if (config.companyWebsiteLink) {
          addCompanyLink(wrapper, "center");
        }

        document.body.appendChild(wrapper);
        document.body.style.overflow = "hidden";
        document.body.dataset.t2msLock = "1";

        requestAnimationFrame(() => {
          wrapper.style.transform = "translate(-50%, -50%) scale(1)";
          fadeIn();
        });

        window.__t2msEscHandler__ = (e) => e.key === "Escape" && removeWidget();
        window.addEventListener("keydown", window.__t2msEscHandler__);

        break;
      }

      default: {
        Object.assign(wrapper.style, {
          width: "320px",
          padding: "16px",
          fontSize: "\${config.fontSize}px",
        });

        contentDiv.style.margin = "0";
        wrapper.appendChild(contentDiv);
        wrapper.appendChild(btn);

        if (config.companyWebsiteLink) {
          addCompanyLink(wrapper, "center");
        }

        applyPosition(type);
        document.body.appendChild(wrapper);
        fadeIn();
        break;
      }
    }

    // Auto-dismiss (except modals, fullscreen)
    if (dismissAfter && !["fullscreen", "modal", "ticker"].includes(type)) {
      setTimeout(removeWidget, dismissAfter);
    }
  }

  // --- Start Widget ---
  fetchMessage();
  setInterval(fetchMessage, FETCH_INTERVAL);
})();
`.trim();

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=60, must-revalidate",
    },
  });
}