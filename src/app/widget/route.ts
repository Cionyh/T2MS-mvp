import { NextResponse } from "next/server";

// OPTIONS preflight for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET() {
  const js = `
(function () {
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

  waitForDOM(function() {
  // Get script element with fallback for defer attribute
  function getScriptElement() {
    // Try currentScript first (works if script isn't deferred)
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

  const script = getScriptElement();
  const clientId = script?.dataset?.clientId;
  const API_BASE = script?.dataset?.api || window.location.origin;
  const WIDGET_ID = "t2ms-widget";
  const interval = 15000;

  // Debug logging
  console.log("T2MS widget: Initializing", {
    clientId: clientId,
    apiBase: API_BASE,
    scriptSrc: script?.src,
    dataApi: script?.dataset?.api
  });

  if (!clientId) {
    console.error("T2MS widget: Missing data-client-id");
    return;
  }
  
  if (!script) {
    console.error("T2MS widget: Could not find script element");
    return;
  }

  function removeWidget() {
    document.getElementById(WIDGET_ID)?.remove();
    document.getElementById(WIDGET_ID + "-overlay")?.remove();

    if (document.body.dataset.t2msLock === "1") {
      document.body.style.overflow = "";
      delete document.body.dataset.t2msLock;
    }

    if (window.__t2msEscHandler__) {
      window.removeEventListener("keydown", window.__t2msEscHandler__);
      window.__t2msEscHandler__ = null;
    }

    window.__T2MS_WIDGET_SHOWN__ = false;
  }

  async function fetchMessage() {
    try {
      const fetchUrl = \`\${API_BASE}/api/message/\${clientId}\`;
      console.log("T2MS widget: Fetching message from", fetchUrl);
      
      const res = await fetch(fetchUrl);
      
      if (!res.ok) {
        console.warn(\`T2MS widget: Request failed with status \${res.status} \${res.statusText}\`);
        const errorText = await res.text();
        console.error("T2MS widget: Error response:", errorText);
        return;
      }

      const data = await res.json();
      console.log("T2MS widget: Received data", data);
      
      if (!data?.pinned) {
        console.log("T2MS widget: Message is not pinned, not showing widget");
        removeWidget();
        return;
      }
      
      if (!data?.content) {
        console.log("T2MS widget: Message has no content, not showing widget");
        removeWidget();
        return;
      }

      if (window.__T2MS_WIDGET_SHOWN__) {
        console.log("T2MS widget: Widget already shown, skipping");
        return;
      }
      
      console.log("T2MS widget: Rendering message");
      renderMessage(data);
    } catch (e) {
      console.error("T2MS widget: Fetch error", e);
    }
  }

  function renderMessage({
    content,
    type,
    bgColor,
    textColor,
    font,
    dismissAfter,
    widgetConfig = {},
  }) {
    removeWidget();

    const wrapper = document.createElement("div");
    wrapper.id = WIDGET_ID;
    wrapper.setAttribute("aria-live", "polite");

    const contentDiv = document.createElement("div");
    contentDiv.className = "t2ms-content";
    contentDiv.innerHTML = escapeHtml(content);

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.onclick = removeWidget;

    Object.assign(closeBtn.style, {
      position: "absolute",
      top: "8px",
      right: "12px",
      fontSize: "20px",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: textColor || "#000",
    });

    Object.assign(wrapper.style, {
      position: "fixed",
      zIndex: "999999",
      fontFamily: font || "Arial, sans-serif",
      backgroundColor: bgColor || "#fff",
      color: textColor || "#000",
      boxSizing: "border-box",
      opacity: "0",
      transition: "transform 300ms ease, opacity 300ms ease",
    });

    /* ---------------- BANNER (FIXED) ---------------- */
    if (type === "banner") {
      Object.assign(wrapper.style, {
        top: "-80px",
        left: "0",
        width: "100%",
        height: "60px",
        lineHeight: "60px",
        padding: "0 80px",
        borderRadius: "0",
        boxShadow: "none",
      });

      Object.assign(contentDiv.style, {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      });

      wrapper.appendChild(contentDiv);
      wrapper.appendChild(closeBtn);
      document.body.appendChild(wrapper);

      requestAnimationFrame(() => {
        wrapper.style.top = "0";
        wrapper.style.opacity = "1";
        window.__T2MS_WIDGET_SHOWN__ = true;
      });
    }

    /* ---------------- TICKER ---------------- */
    else if (type === "ticker") {
      Object.assign(wrapper.style, {
        top: "0",
        left: "0",
        width: "100%",
        height: "60px",
        overflow: "hidden",
        whiteSpace: "nowrap",
      });

      Object.assign(contentDiv.style, {
        display: "inline-block",
        paddingLeft: "100%",
        animation: "t2ms-scroll 20s linear infinite",
      });

      const style = document.createElement("style");
      style.textContent = \`
        @keyframes t2ms-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      \`;
      document.head.appendChild(style);

      wrapper.appendChild(contentDiv);
      document.body.appendChild(wrapper);

      requestAnimationFrame(() => {
        wrapper.style.opacity = "1";
        window.__T2MS_WIDGET_SHOWN__ = true;
      });
    }

    /* ---------------- POPUP ---------------- */
    else {
      Object.assign(wrapper.style, {
        bottom: "20px",
        right: "20px",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        maxWidth: "320px",
      });

      wrapper.appendChild(contentDiv);
      wrapper.appendChild(closeBtn);
      document.body.appendChild(wrapper);

      requestAnimationFrame(() => {
        wrapper.style.opacity = "1";
        window.__T2MS_WIDGET_SHOWN__ = true;
      });
    }

    if (dismissAfter && type !== "fullscreen" && type !== "modal") {
      setTimeout(removeWidget, dismissAfter);
    }
  }

  function escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }

  fetchMessage();
  setInterval(fetchMessage, interval);
  });
})();
`.trim();

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
