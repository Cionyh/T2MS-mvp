import { renderTemplate, wrapHtml } from "./render";

export const WELCOME_HOSTED_SUBJECT = "Your Text2MySite hosted page is ready";
export const WELCOME_HOSTED_PREHEADER =
  "Share your link and post updates by text.";

const BODY_HTML = `
<p>Hi {{first_name}},</p>
<p>Welcome to Text2MySite™! Your hosted announcement page is set up for <strong>{{site_name}}</strong>.</p>
<p><strong>Your public page</strong><br>Share this link with visitors:<br><a href="{{hosted_page_url}}">{{hosted_page_url}}</a></p>
<p><strong>Post updates by text</strong><br>From your verified phone number, text:</p>
<p style="font-size:1.1em;"><strong>{{sms_format_example}}</strong></p>
<p>to <strong>{{text_number}}</strong></p>
<p>Your announcement will appear on your hosted page automatically.</p>
<p><strong>Dashboard</strong><br>Manage your page, branding, and settings anytime:<br><a href="{{dashboard_link}}">{{dashboard_link}}</a></p>
<p>If you need help, reply to this email or contact <a href="mailto:support@t2ms.biz">support@t2ms.biz</a>.</p>
<p>– The T2MS Team</p>
`.trim();

const BODY_TEXT = `
Hi {{first_name}},

Welcome to Text2MySite™! Your hosted announcement page is set up for {{site_name}}.

Your public page
Share this link with visitors:
{{hosted_page_url}}

Post updates by text
From your verified phone number, text:
{{sms_format_example}}
to {{text_number}}

Your announcement will appear on your hosted page automatically.

Dashboard
Manage your page, branding, and settings anytime:
{{dashboard_link}}

If you need help, contact support@t2ms.biz.

– The T2MS Team
`.trim();

export interface WelcomeHostedTemplateVars {
  first_name: string;
  site_name: string;
  hosted_page_url: string;
  text_number: string;
  sms_format_example: string;
  dashboard_link: string;
}

export function renderWelcomeHostedEmail(vars: WelcomeHostedTemplateVars) {
  const v = vars as unknown as Record<string, unknown>;
  return {
    subject: WELCOME_HOSTED_SUBJECT,
    preheader: WELCOME_HOSTED_PREHEADER,
    html: wrapHtml(renderTemplate(BODY_HTML, v), WELCOME_HOSTED_PREHEADER),
    text: renderTemplate(BODY_TEXT, v),
  };
}
