import { NextResponse } from "next/server";

export async function GET() {
  const js = `
(async function () {
  if (window.__T2MS_WIDGET_INITIALIZED__) return;
  window.__T2MS_WIDGET_INITIALIZED__ = true;
  window.__T2MS_WIDGET_SHOWN__ = false; // Flag to show widget only once per page load

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
  }

  async function fetchMessage() {
    try {
      const res = await fetch(\`\${API_BASE}/api/message/\${clientId}\`);
      if (!res.ok) return;
      const data = await res.json();
      const { content, type, bgColor, textColor, font, dismissAfter, pinned } = data;

      if (!pinned) {
        removeWidget();
        return;
      }

      if (!content || window.__T2MS_WIDGET_SHOWN__) return; // Already shown
      renderMessage({ content, type, bgColor, textColor, font, dismissAfter });
    } catch (err) {
      console.error("T2MS widget fetch error:", err);
    }
  }

  function renderMessage({ content, type, bgColor, textColor, font, dismissAfter }) {
    if (window.__T2MS_WIDGET_SHOWN__) return; // prevent multiple renders per page
    window.__T2MS_WIDGET_SHOWN__ = true;

    removeWidget();

    const wrapper = document.createElement("div");
    wrapper.id = WIDGET_ID;
    wrapper.innerHTML = \`
      <div class="t2ms-content">\${escapeHtml(content)}</div>
      <button class="t2ms-close" aria-label="Close">&times;</button>
    \`;

    const btn = wrapper.querySelector("button");
    Object.assign(btn.style, {
      marginLeft: "1em",
      background: "none",
      border: "none",
      color: textColor || "#000",
      fontSize: "1.5em",
      cursor: "pointer",
      transition: "color 0.2s",
    });
    btn.onmouseover = () => (btn.style.color = "#ff5555");
    btn.onmouseout = () => (btn.style.color = textColor || "#000");
    btn.onclick = () => wrapper.remove();

    // Base styles
    Object.assign(wrapper.style, {
      position: "fixed",
      zIndex: "999999",
      fontFamily: font || "Arial, sans-serif",
      backgroundColor: bgColor || "#fff",
      color: textColor || "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1em 1.5em",
      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      borderRadius: "12px",
      textAlign: "center",
      cursor: "default",
      opacity: "0",
      transition: "all 0.4s ease",
    });

    const contentDiv = wrapper.querySelector(".t2ms-content");

    // Type-specific styles and animation
    switch (type) {
      case "banner":
        Object.assign(wrapper.style, {
          top: "-100px",
          left: "0",
          width: "100%",
          flexDirection: "row",
          borderRadius: "0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          padding: "1em",
        });
        requestAnimationFrame(() => {
          wrapper.style.top = "0";
          wrapper.style.opacity = "1";
        });
        break;

      case "popup":
        Object.assign(wrapper.style, {
          bottom: "-120px",
          right: "20px",
          width: "320px",
          maxWidth: "90%",
          flexDirection: "row",
        });
        requestAnimationFrame(() => {
          wrapper.style.bottom = "20px";
          wrapper.style.opacity = "1";
        });
        break;

      case "fullscreen":
        Object.assign(wrapper.style, {
          top: "0",
          left: "0",
          width: "100%",
          height: "100vh",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5em",
          padding: "2em",
        });
        contentDiv.style.fontSize = "2em";
        contentDiv.style.lineHeight = "1.4";
        requestAnimationFrame(() => (wrapper.style.opacity = "1"));
        break;

      case "modal":
        const overlay = document.createElement("div");
        overlay.id = WIDGET_ID + "-overlay";
        Object.assign(overlay.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: "999998",
          opacity: "0",
          transition: "opacity 0.3s ease",
        });
        overlay.onclick = () => wrapper.remove();
        document.body.appendChild(overlay);
        requestAnimationFrame(() => (overlay.style.opacity = "1"));

        Object.assign(wrapper.style, {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0.8)",
          width: "90%",
          maxWidth: "500px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2em",
          fontSize: "1.2em",
        });
        contentDiv.style.fontSize = "1.5em";
        contentDiv.style.lineHeight = "1.5";
        requestAnimationFrame(() => (wrapper.style.transform = "translate(-50%, -50%) scale(1)"));
        requestAnimationFrame(() => (wrapper.style.opacity = "1"));
        break;

      default:
        break;
    }

    document.body.appendChild(wrapper);

    if (dismissAfter && type !== "fullscreen" && type !== "modal") {
      setTimeout(() => wrapper.remove(), dismissAfter);
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
