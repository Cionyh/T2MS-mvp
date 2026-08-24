/**
 * Shared responsive + logo CSS for script embed, iframe, and display widgets.
 * Font sizes use CSS variables set on #t2ms-widget:
 *   --t2ms-mobile-font-size, --t2ms-ticker-font-size,
 *   --t2ms-modal-font-size, --t2ms-fullscreen-font-size
 */
export function getWidgetResponsiveCss(): string {
  return `
#t2ms-widget,
.t2ms-widget-container {
  max-width: 100vw;
  box-sizing: border-box;
}

.t2ms-content {
  overflow-wrap: anywhere;
  word-break: break-word;
}
.t2ms-content strong {
  font-weight: 800;
}
.t2ms-content em {
  font-style: italic;
}

#t2ms-widget[data-type="banner"] {
  white-space: normal;
  height: auto;
  min-height: 56px;
}
#t2ms-widget[data-type="banner"] .t2ms-content {
  white-space: normal;
  height: auto;
  line-height: 1.45;
}

.t2ms-youtube {
  width: 100%;
  max-width: min(720px, 90vw);
  aspect-ratio: 16 / 9;
  margin: 12px auto 0;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  flex-shrink: 0;
}

.t2ms-youtube iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

#t2ms-widget.has-youtube[data-type="modal"],
#t2ms-widget.has-youtube[data-type="fullscreen"] .t2ms-youtube {
  max-width: min(720px, 92vw);
}

#t2ms-widget.has-youtube[data-type="modal"] {
  width: min(720px, 92vw);
  max-width: min(720px, 92vw);
  overflow: auto !important;
}

.t2ms-logo-container {
  position: absolute;
  z-index: 12;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(28px, 7vw, 50px);
  height: clamp(28px, 7vw, 50px);
  top: clamp(4px, 1.2vw, 8px);
  left: clamp(8px, 2vw, 12px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  pointer-events: none;
  box-sizing: border-box;
}

.t2ms-logo-container img {
  max-width: 72%;
  max-height: 72%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 50%;
}

#t2ms-widget.has-logo[data-type="banner"] .t2ms-logo-container,
#t2ms-widget.has-logo[data-type="ticker"] .t2ms-logo-container {
  top: 50%;
  transform: translateY(-50%);
  background: inherit;
}

#t2ms-widget.has-logo[data-type="banner"] .t2ms-content {
  padding-left: calc(clamp(28px, 7vw, 50px) + 20px) !important;
}

#t2ms-widget.has-logo[data-type="popup"],
#t2ms-widget.has-logo[data-type="modal"] {
  padding-top: calc(clamp(28px, 7vw, 50px) + 16px) !important;
  padding-left: calc(clamp(28px, 7vw, 50px) + 16px) !important;
  overflow: visible !important;
}

#t2ms-widget[data-type="fullscreen"] img:not(.t2ms-logo-container img) {
  max-width: 100%;
  height: auto;
  max-height: 40vh;
  object-fit: contain;
}

@media (max-width: 768px) {
  #t2ms-widget[data-type="banner"] {
    height: auto !important;
    min-height: 56px !important;
    line-height: 1.4 !important;
    white-space: normal !important;
    width: 100% !important;
    max-width: 100vw !important;
    left: 0 !important;
    right: 0 !important;
  }
  #t2ms-widget[data-type="banner"] .t2ms-content {
    padding: 14px 52px 14px 16px !important;
    height: auto !important;
    min-height: 56px !important;
    line-height: 1.45 !important;
    font-size: var(--t2ms-mobile-font-size, 15px) !important;
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
  #t2ms-widget.has-logo[data-type="banner"] .t2ms-content {
    padding-left: calc(clamp(24px, 9vw, 36px) + 16px) !important;
  }

  #t2ms-widget[data-type="ticker"] {
    height: auto !important;
    min-height: 50px !important;
    width: 100% !important;
    max-width: 100vw !important;
    left: 0 !important;
    right: 0 !important;
  }
  #t2ms-widget[data-type="ticker"] .t2ms-content {
    padding-right: 50px !important;
    font-size: var(--t2ms-ticker-font-size, 16px) !important;
    height: auto !important;
    min-height: 50px !important;
    line-height: 50px !important;
  }

  #t2ms-widget[data-type="popup"] {
    min-width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px) !important;
    width: calc(100vw - 24px) !important;
    left: 12px !important;
    right: 12px !important;
    top: auto !important;
    bottom: 12px !important;
    transform: none !important;
    padding: 12px !important;
  }
  #t2ms-widget.has-logo[data-type="popup"] {
    padding: 44px 12px 12px 48px !important;
  }
  #t2ms-widget[data-type="popup"] .t2ms-content {
    font-size: var(--t2ms-mobile-font-size, 15px) !important;
  }

  #t2ms-widget[data-type="modal"] {
    max-width: calc(100vw - 24px) !important;
    width: calc(100vw - 24px) !important;
    padding: 20px 24px !important;
    padding-right: 40px !important;
  }
  #t2ms-widget.has-logo[data-type="modal"] {
    padding: 48px 24px 20px 48px !important;
  }
  #t2ms-widget[data-type="modal"] .t2ms-content {
    font-size: var(--t2ms-modal-font-size, 16px) !important;
    max-width: 100% !important;
  }

  #t2ms-widget[data-type="fullscreen"] {
    width: 100% !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    left: 0 !important;
    top: 0 !important;
  }
  #t2ms-widget[data-type="fullscreen"] .t2ms-content {
    font-size: var(--t2ms-fullscreen-font-size, 18px) !important;
    padding: 16px !important;
    max-width: 95vw !important;
  }
  #t2ms-widget[data-type="fullscreen"] > div {
    padding: 16px !important;
    height: 100% !important;
    max-height: 100dvh !important;
  }
  #t2ms-widget[data-type="fullscreen"] img:not(.t2ms-logo-container img) {
    max-height: 28vh !important;
  }

  .t2ms-youtube {
    max-width: 100% !important;
    margin-top: 10px;
  }

  #t2ms-widget.has-youtube[data-type="modal"] {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px) !important;
  }

  .t2ms-logo-container {
    width: clamp(24px, 9vw, 36px) !important;
    height: clamp(24px, 9vw, 36px) !important;
    top: 6px !important;
    left: 8px !important;
  }
  #t2ms-widget.has-logo[data-type="banner"] .t2ms-logo-container,
  #t2ms-widget.has-logo[data-type="ticker"] .t2ms-logo-container {
    top: 50% !important;
    left: 8px !important;
  }

  #t2ms-widget .t2ms-close {
    top: 6px !important;
    right: 8px !important;
    font-size: 1.3em !important;
    padding: 6px !important;
    min-width: 32px !important;
    min-height: 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
}

@media (max-width: 480px) {
  .t2ms-logo-container {
    width: 24px !important;
    height: 24px !important;
    left: 6px !important;
  }
  #t2ms-widget.has-logo[data-type="banner"] .t2ms-content {
    padding-left: 40px !important;
  }
  #t2ms-widget.has-logo[data-type="popup"],
  #t2ms-widget.has-logo[data-type="modal"] {
    padding: 36px 10px 10px 40px !important;
  }
  #t2ms-widget[data-type="popup"],
  #t2ms-widget[data-type="modal"] {
    min-width: calc(100vw - 16px) !important;
    max-width: calc(100vw - 16px) !important;
    width: calc(100vw - 16px) !important;
    left: 8px !important;
    right: 8px !important;
  }
}
`.trim()
}

export function widgetMobileFontVars(config: {
  fontSize: number
  mobileFontSize?: number
}): Record<string, string> {
  const mobile =
    typeof config.mobileFontSize === "number"
      ? config.mobileFontSize
      : Math.max(15, config.fontSize)
  return {
    "--t2ms-mobile-font-size": `${mobile}px`,
    "--t2ms-ticker-font-size": `${Math.max(14, config.fontSize + 2)}px`,
    "--t2ms-modal-font-size": `${Math.max(15, config.fontSize + 2)}px`,
    "--t2ms-fullscreen-font-size": `${Math.max(18, config.fontSize + 6)}px`,
  }
}

export function widgetMobileFontVarStyle(config: {
  fontSize: number
  mobileFontSize?: number
}): string {
  return Object.entries(widgetMobileFontVars(config))
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")
}

export function widgetLogoHtml(escapedLogoUrl: string): string {
  if (!escapedLogoUrl) return ""
  return `<div class="t2ms-logo-container"><img src="${escapedLogoUrl}" alt="Logo" /></div>`
}
