import { NextResponse } from "next/server";

export async function GET() {
  const js = `
(function() {
  'use strict';
  
  // Prevent duplicate initialization
  if (window.__T2MS_IFRAME_SCRIPT_LOADED__) return;
  window.__T2MS_IFRAME_SCRIPT_LOADED__ = true;

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
    if (document.currentScript) {
      return document.currentScript;
    }
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const script = scripts[i];
      if (script.src && script.src.includes('/widget/iframe-script') && script.dataset.clientId) {
        return script;
      }
    }
    return null;
  }

  waitForDOM(function() {
    const script = getScriptElement();
    if (!script) {
      console.error("T2MS iframe widget: Could not find script element");
      return;
    }

    const clientId = script.dataset.clientId;
    const apiBase = script.dataset.api || 'https://www.t2ms.biz';
    const containerId = script.dataset.containerId || 't2ms-iframe-widget';
    const width = script.dataset.width || '100%';
    const height = script.dataset.height || '400';
    const style = script.dataset.style || 'border:none;';

    if (!clientId) {
      console.error("T2MS iframe widget: Missing data-client-id");
      return;
    }

    // Check if iframe already exists
    const existing = document.getElementById(containerId);
    if (existing) {
      console.warn("T2MS iframe widget: Container already exists");
      return;
    }

    // Create iframe element
    const iframe = document.createElement('iframe');
    iframe.id = containerId;
    iframe.src = apiBase + '/widget/iframe?clientId=' + encodeURIComponent(clientId);
    iframe.width = width;
    iframe.height = height;
    iframe.style.cssText = style;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('loading', 'lazy');

    // Find insertion point
    const insertTarget = script.dataset.insertTarget || 'body';
    let targetElement;

    if (insertTarget === 'body') {
      targetElement = document.body;
    } else if (insertTarget.startsWith('#')) {
      targetElement = document.getElementById(insertTarget.substring(1));
    } else if (insertTarget.startsWith('.')) {
      targetElement = document.querySelector(insertTarget);
    } else {
      targetElement = document.querySelector(insertTarget);
    }

    if (!targetElement) {
      console.error("T2MS iframe widget: Target element not found: " + insertTarget);
      targetElement = document.body;
    }

    // Insert iframe
    if (script.dataset.insertPosition === 'before') {
      targetElement.insertBefore(iframe, targetElement.firstChild);
    } else if (script.dataset.insertPosition === 'after') {
      targetElement.appendChild(iframe);
      if (targetElement !== document.body) {
        targetElement.insertAdjacentElement('afterend', iframe);
      }
    } else {
      targetElement.appendChild(iframe);
    }

    // Optional: Resize iframe based on content (requires postMessage from iframe)
    window.addEventListener('message', function(event) {
      if (event.origin !== new URL(apiBase).origin) return;
      if (event.data && event.data.type === 't2ms-resize' && event.data.clientId === clientId) {
        iframe.style.height = event.data.height + 'px';
      }
    });
  });
})();
`;

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

