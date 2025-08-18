// /app/widget/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const js = `
(function () {
  if (window.__T2MS_WIDGET_INITIALIZED__) return;
  window.__T2MS_WIDGET_INITIALIZED__ = true;

  const script = document.currentScript;
  const clientId = script.dataset.clientId;
  const type = script.dataset.type || "banner";
  const bgColor = script.dataset.bg || "#222";
  const textColor = script.dataset.color || "#fff";
  const font = script.dataset.font || "sans-serif";
  const interval = 15000;
  const WIDGET_ID = "t2ms-widget";
  const API_BASE = script.dataset.api || window.location.origin;

  if (!clientId) {
    console.error("T2MS widget: Missing data-client-id");
    return;
  }

  async function fetchMessage() {
    try {
      const res = await fetch(\`\${API_BASE}/api/message/\${clientId}\`);
      if (!res.ok) return;
      const { content } = await res.json();
      if (!content) return;
      renderMessage(content);
    } catch (err) {
      console.error("T2MS widget fetch error:", err);
    }
  }

  function renderMessage(content) {
    const existing = document.getElementById(WIDGET_ID);
    if (existing) existing.remove();

    const wrapper = document.createElement("div");
    wrapper.id = WIDGET_ID;
    wrapper.innerHTML = \`
      <div style="flex:1">\${escapeHtml(content)}</div>
      <button style="margin-left:1em;background:none;border:none;color:\${textColor};font-size:1.5em;cursor:pointer">&times;</button>
    \`;

    Object.assign(wrapper.style, {
      position: "fixed",
      zIndex: "999999",
      fontFamily: font,
      backgroundColor: bgColor,
      color: textColor,
      padding: "1em",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      borderRadius: type === "popup" ? "8px" : "0",
      width: type === "popup" ? "320px" : "100%",
      maxWidth: type === "popup" ? "90%" : "100%",
      left: type === "popup" ? "auto" : "0",
      right: type === "popup" ? "20px" : "0",
      top: type === "fullscreen" || type === "banner" ? "0" : "auto",
      bottom: type === "popup" ? "20px" : type === "fullscreen" ? "0" : "auto",
      height: type === "fullscreen" ? "100vh" : "auto",
      flexDirection: type === "fullscreen" ? "column" : "row",
      textAlign: "center",
    });

    wrapper.querySelector("button").onclick = () => wrapper.remove();
    document.body.appendChild(wrapper);
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
