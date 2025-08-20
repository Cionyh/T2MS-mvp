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
      const { content, type, bgColor, textColor, font, dismissAfter, pinned } = data;

      if (!pinned) {
        removeWidget();
        return;
      }

      if (!content || window.__T2MS_WIDGET_SHOWN__) return;
      renderMessage({ content, type, bgColor, textColor, font, dismissAfter });
    } catch (err) {
      console.error("T2MS widget fetch error:", err);
    }
  }

  function renderMessage({ content, type, bgColor, textColor, font, dismissAfter }) {
    if (window.__T2MS_WIDGET_SHOWN__) return;
    window.__T2MS_WIDGET_SHOWN__ = true;

    removeWidget();

    const wrapper = document.createElement("div");
    wrapper.id = WIDGET_ID;
    wrapper.setAttribute("aria-live", "polite");

    wrapper.innerHTML = \`
      <div class="t2ms-content">\${escapeHtml(content)}</div>
      <button class="t2ms-close" aria-label="Close notification" title="Close">&times;</button>
    \`;

    const btn = wrapper.querySelector(".t2ms-close");
    const contentDiv = wrapper.querySelector(".t2ms-content");

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
      paddingRight: "3rem",
      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      borderRadius: "12px",
      textAlign: "center",
      cursor: "default",
      opacity: "0",
      transition: "all 0.4s ease",
      boxSizing: "border-box",
      overflow: "hidden",
    });

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

    switch (type) {
      case "banner": {
        wrapper.setAttribute("role", "status");
        Object.assign(wrapper.style, {
          top: "-100px",
          left: "0",
          width: "100%",
          borderRadius: "0",
          padding: "1em 3rem 1em 1.25em",
        });
        document.body.appendChild(wrapper);
        requestAnimationFrame(() => {
          wrapper.style.top = "0";
          wrapper.style.opacity = "1";
        });
        break;
      }

      case "ticker": {
        wrapper.setAttribute("role", "status");
        Object.assign(wrapper.style, {
          top: "0",
          left: "0",
          width: "100%",
          borderRadius: "0",
          overflow: "hidden",
          whiteSpace: "nowrap",
        });

        Object.assign(contentDiv.style, {
          display: "inline-block",
          paddingLeft: "100%",
          animation: "t2ms-ticker-scroll 24s linear infinite",
          fontSize: "1.5em",
        });

        const styleTag = document.createElement("style");
        styleTag.textContent = \`
          @keyframes t2ms-ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        \`;
        document.head.appendChild(styleTag);

        document.body.appendChild(wrapper);
        requestAnimationFrame(() => (wrapper.style.opacity = "1"));
        break;
      }

      case "popup": {
        wrapper.setAttribute("role", "status");
        Object.assign(wrapper.style, {
          bottom: "-120px",
          right: "20px",
          width: "320px",
          maxWidth: "90%",
        });
        document.body.appendChild(wrapper);
        requestAnimationFrame(() => {
          wrapper.style.bottom = "20px";
          wrapper.style.opacity = "1";
        });
        break;
      }

      case "fullscreen": {
        wrapper.setAttribute("role", "dialog");
        wrapper.setAttribute("aria-modal", "true");
        Object.assign(wrapper.style, {
          top: "0",
          left: "0",
          width: "100%",
          height: "100vh",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5em",
          borderRadius: "0",
        });
        Object.assign(contentDiv.style, {
          fontSize: "2em",
          lineHeight: "1.4",
          maxWidth: "min(800px, 90vw)",
        });
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
          zIndex: "999998",
          opacity: "0",
          transition: "opacity 0.3s ease",
        });
        overlay.onclick = () => removeWidget();
        document.body.appendChild(overlay);
        requestAnimationFrame(() => (overlay.style.opacity = "1"));

        Object.assign(wrapper.style, {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0.85)",
          width: "90%",
          maxWidth: "560px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2em 2.5em",  
          borderRadius: "12px",   
        });
        Object.assign(contentDiv.style, {
          fontSize: "1.5em",
          lineHeight: "1.5",
          maxWidth: "min(680px, 90vw)",
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
        document.body.appendChild(wrapper);
        requestAnimationFrame(() => (wrapper.style.opacity = "1"));
        break;
      }
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
