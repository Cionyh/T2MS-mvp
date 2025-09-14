import { NextResponse } from "next/server";


export async function GET() {
  const js = `
(async function () {
  if (window.__T2MS_WIDGET_INITIALIZED__) return;
  window.__T2MS_WIDGET_INITIALIZED__ = true;
  window.__T2MS_WIDGET_SHOWN__ = false; // show once per page load

  const script = document.currentScript;
  const clientId = script.dataset.clientId;
  const WIDGET_ID = "t2ms-widget";
  const API_BASE = script.dataset.api || window.location.origin;
  const interval = 15000;

  

  if (!clientId) {
    console.error("T2MS widget: Missing data-client-id");
    return;
  }

    

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
      const { content, type, bgColor, textColor, font, dismissAfter, pinned, widgetConfig } = data;

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

  function renderMessage({ content, type, bgColor, textColor, font, dismissAfter, widgetConfig = {} }) {
    if (window.__T2MS_WIDGET_SHOWN__) return;
    window.__T2MS_WIDGET_SHOWN__ = true;

    removeWidget();

    const wrapper = document.createElement("div");
    wrapper.id = WIDGET_ID;
    wrapper.setAttribute("aria-live", "polite");

    // Add custom CSS classes if provided
    if (widgetConfig.customCssClasses) {
      wrapper.className = widgetConfig.customCssClasses;
    }

    wrapper.innerHTML = \`
      <div class="t2ms-content">\${escapeHtml(content)}</div>
      <button class="t2ms-close" aria-label="Close notification" title="Close">&times;</button>
    \`;

    const btn = wrapper.querySelector(".t2ms-close");
    const contentDiv = wrapper.querySelector(".t2ms-content");

    // Apply widget configuration with fallbacks
    const config = {
      // Logo and branding
      logoUrl: widgetConfig.logoUrl || "",
      companyWebsiteLink: widgetConfig.companyWebsiteLink || "",
      backgroundImageUrl: widgetConfig.backgroundImageUrl || "",
      attachImage: widgetConfig.attachImage || "",
      presetText: widgetConfig.presetText || "",
      
      // Border styling
      borderStyle: widgetConfig.borderStyle || "solid",
      
      // Position and animation
      widgetPosition: widgetConfig.widgetPosition || "top-right",
      animationType: widgetConfig.animationType || "fade",
      animationDuration: widgetConfig.animationDuration || 300,
      
      // Typography
      fontSize: widgetConfig.fontSize || 14,
    };

    // Apply base styles with sensible defaults
    Object.assign(wrapper.style, {
      position: "fixed",
      zIndex: "999999",
      fontFamily: font || "Arial, sans-serif",
      fontSize: \`\${config.fontSize}px\`,
      backgroundColor: bgColor || "#fff",
      color: textColor || "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      borderRadius: "8px",
      textAlign: "center",
      cursor: "default",
      opacity: "0",
      transition: \`all \${config.animationDuration}ms ease\`,
      boxSizing: "border-box",
      overflow: "hidden",
      width: "320px",
      minHeight: "60px",
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "1.5",
      border: config.borderStyle !== "none" ? \`1px \${config.borderStyle} #e5e7eb\` : "none",
    });

    // Apply background image if provided
    if (config.backgroundImageUrl) {
      wrapper.style.backgroundImage = \`url("\${config.backgroundImageUrl}")\`;
      wrapper.style.backgroundSize = "cover";
      wrapper.style.backgroundPosition = "center";
      wrapper.style.backgroundRepeat = "no-repeat";
    }


    Object.assign(btn.style, {
      position: "absolute",
      top: "8px",
      right: "12px",
      background: "none",
      border: "none",
      color: textColor || "#000",
      fontSize: "1.5em",
      lineHeight: "1",
      cursor: "pointer",
      transition: "opacity 0.2s, transform 0.2s, color 0.2s",
      opacity: "0.85",
    });
    btn.onmouseover = () => {
      btn.style.opacity = "1";
      btn.style.transform = "scale(1.05)";
      btn.style.color = "#ff5555";
    };
    btn.onmouseout = () => {
      btn.style.opacity = "0.85";
      btn.style.transform = "none";
      btn.style.color = textColor || "#000";
    };
    btn.onclick = () => removeWidget();

    // Apply position-specific styles
    function applyPosition(wrapper, type) {
      const position = config.widgetPosition;
      const margin = 10; // Fixed margin
      
      // Reset positioning
      wrapper.style.top = "";
      wrapper.style.bottom = "";
      wrapper.style.left = "";
      wrapper.style.right = "";
      wrapper.style.transform = "";
      
      if (type === "banner") {
        wrapper.style.width = "100%";
        wrapper.style.borderRadius = "0";
        wrapper.style.padding = "1em 3rem 1em 1.25em";
        
        if (position.includes("top")) {
          wrapper.style.top = "-100px";
        } else if (position.includes("bottom")) {
          wrapper.style.bottom = "-100px";
        }
      } else if (type === "popup") {
        // Only apply position for popup widgets
        if (position.includes("top")) {
          wrapper.style.top = \`\${margin}px\`;
        } else if (position.includes("bottom")) {
          wrapper.style.bottom = \`\${margin}px\`;
        } else {
          wrapper.style.top = "50%";
          wrapper.style.transform = "translateY(-50%)";
        }
        
        if (position.includes("left")) {
          wrapper.style.left = \`\${margin}px\`;
        } else if (position.includes("right")) {
          wrapper.style.right = \`\${margin}px\`;
        } else if (position.includes("center")) {
          wrapper.style.left = "50%";
          wrapper.style.transform = wrapper.style.transform ? 
            wrapper.style.transform + " translateX(-50%)" : 
            "translateX(-50%)";
        }
      } else {
        // For other widget types, use default positioning
        wrapper.style.top = "20px";
        wrapper.style.right = "20px";
      }
    }

    switch (type) {
      case "banner": {
        wrapper.setAttribute("role", "status");
        Object.assign(wrapper.style, {
          width: "100%",
          height: "60px",
          top: "0",
          left: "0",
          right: "0",
          bottom: "auto",
          borderRadius: "0",
          overflow: "hidden",
          whiteSpace: "nowrap",
          margin: "0",
          padding: "0",
          display: "block",
          alignItems: "stretch",
          justifyContent: "flex-start",
          textAlign: "left",
          boxShadow: "none",
        });

        Object.assign(contentDiv.style, {
          display: "inline-block",
          fontSize: \`\${config.fontSize}px\`,
          lineHeight: "60px",
          height: "60px",
          margin: "0",
          padding: "0 80px 0 80px",
        });
        
        document.body.appendChild(wrapper);
        
        // Banner should always be at top by default
        requestAnimationFrame(() => {
          wrapper.style.top = "0";
          wrapper.style.opacity = "1";
        });
        break;
      }

      case "ticker": {
        wrapper.setAttribute("role", "status");
        Object.assign(wrapper.style, {
          width: "100%",
          height: "60px",
          top: "0",
          left: "0",
          right: "0",
          bottom: "auto",
          borderRadius: "0",
          overflow: "hidden",
          whiteSpace: "nowrap",
          margin: "0",
          padding: "0",
          display: "block",
          alignItems: "stretch",
          justifyContent: "flex-start",
          textAlign: "left",
          boxShadow: "none",
        });

        Object.assign(contentDiv.style, {
          display: "inline-block",
          paddingLeft: "100%",
          paddingRight: "80px",
          animation: \`t2ms-ticker-scroll \${config.animationDuration * 20}ms linear infinite\`,
          fontSize: \`\${config.fontSize + 4}px\`,
          height: "60px",
          lineHeight: "60px",
          margin: "0",
        });

        const styleTag = document.createElement("style");
        styleTag.textContent = \`
          @keyframes t2ms-ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        \`;
        document.head.appendChild(styleTag);

        // Add company link for ticker if provided - static position, show actual URL
        if (config.companyWebsiteLink) {
          const linkContainer = document.createElement("div");
          linkContainer.style.cssText = \`
            position: absolute;
            top: 50%;
            right: 12px;
            transform: translateY(-50%);
            z-index: 10;
            padding: 0;
            margin: 0;
          \`;
          
          const link = document.createElement("a");
          link.href = config.companyWebsiteLink;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = config.companyWebsiteLink;
          link.style.cssText = \`
            color: #3b82f6;
            text-decoration: underline;
            font-size: 14px;
            display: inline-block;
            opacity: 0.8;
            transition: opacity 0.2s ease;
            white-space: nowrap;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0;
            margin: 0;
          \`;
          
          link.onmouseover = () => { link.style.opacity = "1"; };
          link.onmouseout = () => { link.style.opacity = "0.8"; };
          
          linkContainer.appendChild(link);
          wrapper.appendChild(linkContainer);
        }

        applyPosition(wrapper, type);
        document.body.appendChild(wrapper);
        requestAnimationFrame(() => (wrapper.style.opacity = "1"));
        break;
      }

      case "banner": {
        // Add company link for banner if provided - static position, show actual URL
        if (config.companyWebsiteLink) {
          const linkContainer = document.createElement("div");
          linkContainer.style.cssText = \`
            position: absolute;
            top: 50%;
            right: 12px;
            transform: translateY(-50%);
            z-index: 10;
            padding: 0;
            margin: 0;
          \`;
          
          const link = document.createElement("a");
          link.href = config.companyWebsiteLink;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = config.companyWebsiteLink;
          link.style.cssText = \`
            color: #3b82f6;
            text-decoration: underline;
            font-size: 14px;
            display: inline-block;
            opacity: 0.8;
            transition: opacity 0.2s ease;
            white-space: nowrap;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0;
            margin: 0;
          \`;
          
          link.onmouseover = () => { link.style.opacity = "1"; };
          link.onmouseout = () => { link.style.opacity = "0.8"; };
          
          linkContainer.appendChild(link);
          wrapper.appendChild(linkContainer);
        }
        break;
      }

      case "popup": {
        wrapper.setAttribute("role", "status");
        Object.assign(wrapper.style, {
          width: "320px",
          maxWidth: "90%",
          paddingRight: "36px",
        });
        
        // Apply specific content styling for popup
        Object.assign(contentDiv.style, {
          fontSize: \`\${config.fontSize}px\`,
          lineHeight: "1.4",
        });
        
        applyPosition(wrapper, type);
        document.body.appendChild(wrapper);
        
        // Apply animation based on position
        const position = config.widgetPosition;
        if (position.includes("bottom")) {
          wrapper.style.bottom = \`-\${config.widgetHeight + 20}px\`;
          requestAnimationFrame(() => {
            wrapper.style.bottom = \`\${config.margin}px\`;
            wrapper.style.opacity = "1";
          });
        } else if (position.includes("top")) {
          wrapper.style.top = \`-\${config.widgetHeight + 20}px\`;
        requestAnimationFrame(() => {
            wrapper.style.top = \`\${config.margin}px\`;
          wrapper.style.opacity = "1";
        });
        } else {
          requestAnimationFrame(() => (wrapper.style.opacity = "1"));
        }
        break;
      }

      case "fullscreen": {
        wrapper.setAttribute("role", "dialog");
        wrapper.setAttribute("aria-modal", "true");
        
        // Create a container for all content
        const contentContainer = document.createElement("div");
        contentContainer.style.cssText = \`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100vh;
          padding: 20px;
          box-sizing: border-box;
          overflow-y: auto;
        \`;
        
        // Create preset text element if provided
        if (config.presetText) {
          const presetTextDiv = document.createElement("div");
          presetTextDiv.style.cssText = \`
            font-size: \${config.fontSize + 4}px;
            font-weight: 500;
            color: \${config.textColor};
            text-align: center;
            margin-bottom: 20px;
            max-width: min(480px, 80vw);
            line-height: 1.5;
            padding: 15px;
          \`;
          presetTextDiv.textContent = config.presetText;
          contentContainer.appendChild(presetTextDiv);
        }
        
        // Create image container if provided
        if (config.attachImage) {
          const imageContainer = document.createElement("div");
          imageContainer.style.cssText = \`
            margin-bottom: 20px;
            text-align: center;
            max-width: min(384px, 70vw);
          \`;
          
          const img = document.createElement("img");
          img.src = config.attachImage;
          img.style.cssText = \`
            max-width: 100%;
            max-height: 40vh;
            object-fit: contain;
            display: block;
            margin: 0 auto;
          \`;
          
          imageContainer.appendChild(img);
          contentContainer.appendChild(imageContainer);
        }
        
        // Style the main content div
        Object.assign(contentDiv.style, {
          fontSize: \`\${config.fontSize + 10}px\`,
          lineHeight: "1.5",
          maxWidth: "min(480px, 85vw)",
          textAlign: "center",
          padding: "20px",
        });
        
        // Style the wrapper
        Object.assign(wrapper.style, {
          top: "0",
          left: "0",
          width: "100%",
          height: "100vh",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "16px",
          borderRadius: "0",
          padding: "0",
        });
        
        // Append content container to wrapper
        contentContainer.appendChild(contentDiv);
        wrapper.appendChild(contentContainer);

        document.body.style.overflow = "hidden";
        document.body.dataset.t2msLock = "1";
        document.body.appendChild(wrapper);
        requestAnimationFrame(() => (wrapper.style.opacity = "1"));
        window.__t2msEscHandler__ = (e) => { if (e.key === "Escape") removeWidget(); };
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
          top: "0",
          left: "0",
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: (config.zIndex - 1).toString(),
          opacity: "0",
          transition: \`opacity \${config.animationDuration}ms ease\`,
        });
        overlay.onclick = () => removeWidget();
        document.body.appendChild(overlay);
        requestAnimationFrame(() => (overlay.style.opacity = "1"));

        Object.assign(wrapper.style, {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0.85)",
          width: "90%",
          maxWidth: "400px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "32px 40px",
          paddingRight: "56px",
          borderRadius: "12px",
        });
        Object.assign(contentDiv.style, {
          fontSize: \`\${config.fontSize + 4}px\`,
          lineHeight: "1.5",
          maxWidth: "min(480px, 90vw)",
        });

        document.body.style.overflow = "hidden";
        document.body.dataset.t2msLock = "1";

        document.body.appendChild(wrapper);
        requestAnimationFrame(() => {
          wrapper.style.transform = "translate(-50%, -50%) scale(1)";
          wrapper.style.opacity = "1";
        });

        window.__t2msEscHandler__ = (e) => { if (e.key === "Escape") removeWidget(); };
        window.addEventListener("keydown", window.__t2msEscHandler__);
        break;
      }

      default: {
        applyPosition(wrapper, type);
        document.body.appendChild(wrapper);
        requestAnimationFrame(() => (wrapper.style.opacity = "1"));
        break;
      }
    }

    // Add logo if provided - display in circular box
    if (config.logoUrl) {
      const logoContainer = document.createElement("div");
      logoContainer.style.cssText = \`
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(1px);
        margin-right: 12px;
        margin-bottom: 8px;
        flex-shrink: 0;
      \`;
      
      const logoImg = document.createElement("img");
      logoImg.src = config.logoUrl;
      logoImg.style.cssText = \`
        max-width: 32px;
        max-height: 32px;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 50%;
      \`;
      
      logoContainer.appendChild(logoImg);
      
      // For ticker and banner, add logo to wrapper (static position)
      // For other widgets, add to contentDiv
      if (type === "ticker" || type === "banner") {
        logoContainer.style.cssText = \`
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          z-index: 10;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(1px);
          margin: 0;
          padding: 0;
        \`;
        wrapper.appendChild(logoContainer);
      } else {
        contentDiv.insertBefore(logoContainer, contentDiv.firstChild);
      }
    }

    // Add company link if provided - display as visible clickable link (exclude ticker and banner - handled separately)
    if (config.companyWebsiteLink && type !== "ticker" && type !== "banner") {
      const linkContainer = document.createElement("div");
      linkContainer.style.cssText = \`
        margin-top: 8px;
        text-align: center;
      \`;
      
      const link = document.createElement("a");
      link.href = config.companyWebsiteLink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = config.companyWebsiteLink;
      link.style.cssText = \`
        color: #3b82f6;
        text-decoration: underline;
        font-size: 14px;
        word-break: break-all;
        display: inline-block;
        max-width: 100%;
        opacity: 0.8;
        transition: opacity 0.2s ease;
      \`;
      
      link.onmouseover = () => { link.style.opacity = "1"; };
      link.onmouseout = () => { link.style.opacity = "0.8"; };
      
      linkContainer.appendChild(link);
      contentDiv.appendChild(linkContainer);
    }

    if (type !== "ticker" && dismissAfter && type !== "fullscreen" && type !== "modal") {
  setTimeout(() => removeWidget(), dismissAfter);
}
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  fetchMessage();
  setInterval(fetchMessage, interval);
})();
`.trim();

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
