import { NextResponse } from "next/server";


export async function GET() {
  const js = `
(async function () {
  try {
    // Prevent duplicate initialization
    if (window.__T2MS_WIDGET_INITIALIZED__) return;
    window.__T2MS_WIDGET_INITIALIZED__ = true;
    window.__T2MS_WIDGET_SHOWN__ = false;

    // Wait for DOM to be ready
    function waitForDOM(callback) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
      } else {
        callback();
      }
    }

    // Get script element with fallback
    function getScriptElement() {
      // Try currentScript first (modern browsers)
      if (document.currentScript) {
        return document.currentScript;
      }
      // Fallback: find script tag by src attribute
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        const script = scripts[i];
        if (script.src && script.src.includes('/widget') && script.dataset.clientId) {
          return script;
        }
      }
      return null;
    }

    waitForDOM(function() {
      const script = getScriptElement();
      if (!script) {
        console.error("T2MS widget: Could not find script element");
        return;
      }

      const clientId = script.dataset.clientId;
      const WIDGET_ID = "t2ms-widget";
      const API_BASE = script.dataset.api || window.location.origin;
      const interval = 15000;
      
      // Track last message state to detect changes
      let lastMessageContent = null;
      let lastPinnedState = null;
      
      // Race condition protection: prevent concurrent fetches
      let isFetching = false;
      
      // Debounce timer
      let debounceTimer = null;
      const debounceDelay = 500; // 500ms debounce

      if (!clientId) {
        console.error("T2MS widget: Missing data-client-id");
        return;
      }

    

      function removeWidget() {
        const existing = document.getElementById(WIDGET_ID);
        if (existing) existing.remove();
        const overlay = document.getElementById(WIDGET_ID + "-overlay");
        if (overlay) overlay.remove();

        if (document.body && document.body.dataset.t2msLock === "1") {
          document.body.style.overflow = "";
          delete document.body.dataset.t2msLock;
        }

        if (window.__t2msEscHandler__) {
          window.removeEventListener("keydown", window.__t2msEscHandler__);
          window.__t2msEscHandler__ = null;
        }
        
        // Reset widget shown flag when widget is removed
        window.__T2MS_WIDGET_SHOWN__ = false;
      }

      // Retry mechanism with exponential backoff
      async function fetchMessageWithRetry(maxRetries = 3, retryDelay = 1000) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            // Create timeout controller for fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const res = await fetch(\`\${API_BASE}/api/message/\${clientId}\`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (res.ok) {
              return await res.json();
            }
            
            // If not OK and not last attempt, retry
            if (attempt < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
              continue;
            }
            
            return null;
          } catch (err) {
            // Network error or timeout
            if (err.name === 'AbortError') {
              console.warn("T2MS widget: Request timeout");
            }
            
            if (attempt < maxRetries - 1) {
              const delay = retryDelay * Math.pow(2, attempt);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            console.error("T2MS widget: Failed to fetch message after", maxRetries, "attempts:", err);
            return null;
          }
        }
        return null;
      }

      // Debounced fetch function
      function debouncedFetchMessage() {
        // Clear existing timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        // Set new timer
        debounceTimer = setTimeout(() => {
          fetchMessage();
        }, debounceDelay);
      }

      async function fetchMessage() {
        // Prevent race condition: skip if already fetching
        if (isFetching) {
          return;
        }
        
        try {
          isFetching = true;
          
          const data = await fetchMessageWithRetry();
          if (!data) {
            return;
          }
          
          const { content, type, bgColor, textColor, font, dismissAfter, pinned, widgetConfig } = data;

          // Check if pinned state changed
          if (!pinned) {
            // If message is no longer pinned, remove widget
            if (lastPinnedState === true) {
              removeWidget();
              lastPinnedState = false;
              lastMessageContent = null;
            }
            return;
          }

          // Check if message content or pinned state changed
          const contentChanged = content !== lastMessageContent;
          const pinnedStateChanged = pinned !== lastPinnedState;
          
          // Update tracked state
          lastMessageContent = content;
          lastPinnedState = pinned;

          // Render if:
          // 1. Content exists
          // 2. Either content changed OR pinned state changed OR widget not shown yet
          if (content && (contentChanged || pinnedStateChanged || !window.__T2MS_WIDGET_SHOWN__)) {
            // Reset flag to allow re-rendering
            window.__T2MS_WIDGET_SHOWN__ = false;
            renderMessage({ content, type, bgColor, textColor, font, dismissAfter, widgetConfig });
          }
        } catch (err) {
          console.error("T2MS widget fetch error:", err);
        } finally {
          isFetching = false;
        }
      }

      function renderMessage({ content, type, bgColor, textColor, font, dismissAfter, widgetConfig = {} }) {
        if (window.__T2MS_WIDGET_SHOWN__) return;
        window.__T2MS_WIDGET_SHOWN__ = true;

        // Ensure document.body exists before rendering
        if (!document.body) {
          console.error("T2MS widget: document.body not available");
          return;
        }

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
    height: "auto",          // adjust height to fit content + link
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
    display: "block",
    fontSize: \`\${config.fontSize}px\`,
    lineHeight: "60px",
    height: "60px",
    margin: "0",
    padding: "0 80px 0 80px",
  });

  document.body.appendChild(wrapper);

  // Add company link below banner content
  if (config.companyWebsiteLink) {
    const linkContainer = document.createElement("div");
    linkContainer.style.cssText = \`
      display: block;
      text-align: center;
      padding: 8px 0;
      background-color: #f9f9f9;  /* optional: separate row background */
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
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    \`;

    link.onmouseover = () => { link.style.opacity = "1"; };
    link.onmouseout = () => { link.style.opacity = "0.8"; };

    linkContainer.appendChild(link);
    wrapper.appendChild(linkContainer);
  }

  // Banner always shows at top
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
    height: "auto", // allow for content + link
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
    position: "fixed",
    zIndex: "999999",
    backgroundColor: bgColor || "#fff",
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

  wrapper.appendChild(contentDiv);

  // Add company link INSIDE ticker wrapper below content
  if (config.companyWebsiteLink) {
    const linkContainer = document.createElement("div");
    linkContainer.style.cssText = \`
      width: 100%;
      text-align: center;
      padding: 8px 0;
      background-color: #f9f9f9;
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
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    \`;

    link.onmouseover = () => { link.style.opacity = "1"; };
    link.onmouseout = () => { link.style.opacity = "0.8"; };

    linkContainer.appendChild(link);
    wrapper.appendChild(linkContainer);
  }

  document.body.appendChild(wrapper);
  requestAnimationFrame(() => (wrapper.style.opacity = "1"));
  break;
}
      case "popup": {
  wrapper.setAttribute("role", "status");
  Object.assign(wrapper.style, {
    width: "auto",
    maxWidth: "90%",
    minWidth: "280px",
    padding: "16px",
    boxSizing: "border-box",
  });

  // Create a container for content + link
  const popupContainer = document.createElement("div");
  popupContainer.style.cssText = \`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  \`;

  // Style content div
  Object.assign(contentDiv.style, {
    fontSize: \`\${config.fontSize}px\`,
    lineHeight: "1.4",
    width: "100%",
  });
  popupContainer.appendChild(contentDiv);

  // Add company link neatly below content if provided
  if (config.companyWebsiteLink) {
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
      word-break: break-word;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    \`;
    link.onmouseover = () => { link.style.opacity = "1"; };
    link.onmouseout = () => { link.style.opacity = "0.8"; };
    popupContainer.appendChild(link);
  }

  // Append container to wrapper
  wrapper.appendChild(popupContainer);

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
        
        // Style the main content div first
        Object.assign(contentDiv.style, {
          fontSize: \`\${config.fontSize + 10}px\`,
          lineHeight: "1.5",
          maxWidth: "85vw",
          textAlign: "center",
          padding: "20px",
          marginBottom: "20px",
        });
        
        // Append message content first
        contentContainer.appendChild(contentDiv);
        
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
          width: "auto",
          maxWidth: "90vw",
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
       if (["popup", "fullscreen", "modal"].includes(type)) {
    wrapper.style.paddingTop = "70px";   // 50px logo + 20px spacing
    wrapper.style.paddingLeft = "70px";
  }


      const logoContainer = document.createElement("div");
      logoContainer.style.cssText = \`
         position: absolute;
    top: 8px;
    left: 12px;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(1px);
    margin: 0;   /* margin not needed since padding handles spacing */
    padding: 0;
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
      wrapper.appendChild(logoContainer);
    }

    // Add company link if provided - display as visible clickable link (exclude ticker and banner - handled separately)
    if (config.companyWebsiteLink && type !== "ticker" && type !== "banner" && type !== "popup") {
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
      wrapper.appendChild(linkContainer);
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

      // Initial fetch
      fetchMessage();
      
      // Set up polling with debouncing
      setInterval(() => {
        debouncedFetchMessage();
      }, interval);
    });
  } catch (err) {
    console.error("T2MS widget initialization error:", err);
    // Reset initialization flag on error to allow retry
    window.__T2MS_WIDGET_INITIALIZED__ = false;
  }
})();
`.trim();

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

