/**
 * Replace {{variable}} placeholders in a string.
 * Accepts any object with string values (e.g. WelcomeTemplateVars, PasswordResetTemplateVars).
 */
export function renderTemplate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = vars[key];
    return v != null ? String(v) : "";
  });
}

/**
 * Wrap HTML body with preheader (visible in inbox preview) and minimal wrapper.
 */
export function wrapHtml(body: string, preheader?: string): string {
  const preheaderBlock =
    preheader != null
      ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>`
      : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${preheaderBlock}${body}</body></html>`;
}
