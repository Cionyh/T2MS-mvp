import { renderTemplate, wrapHtml } from "./render";

export const PASSWORD_RESET_SUBJECT = "Reset Your Password – Text2MySite™";
export const PASSWORD_RESET_PREHEADER =
  "Click below to securely reset your password.";

const BODY_HTML = `
<p>Hi {{first_name}},</p>
<p>We received a request to reset your password.</p>
<p>Click the link below to set a new password:</p>
<p><a href="{{reset_link}}">{{reset_link}}</a></p>
<p>This link will expire for security purposes.</p>
<p>If you did not request a password reset, you can safely ignore this email.</p>
<p>– The T2MS Team<br><a href="mailto:support@t2ms.biz">support@t2ms.biz</a></p>
`.trim();

const BODY_TEXT = `
Hi {{first_name}},

We received a request to reset your password.

Click the link below to set a new password:
{{reset_link}}

This link will expire for security purposes.

If you did not request a password reset, you can safely ignore this email.

– The T2MS Team
support@t2ms.biz
`.trim();

export interface PasswordResetTemplateVars {
  first_name: string;
  reset_link: string;
}

export function renderPasswordResetEmail(vars: PasswordResetTemplateVars) {
  const v = vars as unknown as Record<string, unknown>;
  return {
    subject: PASSWORD_RESET_SUBJECT,
    preheader: PASSWORD_RESET_PREHEADER,
    html: wrapHtml(renderTemplate(BODY_HTML, v), PASSWORD_RESET_PREHEADER),
    text: renderTemplate(BODY_TEXT, v),
  };
}
