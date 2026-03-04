import { renderTemplate, wrapHtml } from "./render";

export const WIDGET_LIVE_SUBJECT = "Your T2MS Widget Is Live 🎉";
export const WIDGET_LIVE_PREHEADER = "You can now update your website by text.";

const BODY_HTML = `
<p>Hi {{first_name}},</p>
<p>Great news — your T2MS widget is now live on:</p>
<p><strong>{{website_url}}</strong></p>
<p>To update your website, simply text your message from your verified phone number to:</p>
<p>📱 424-484-8267</p>
<p>Your message will publish instantly to your site.</p>
<p>You can log in to your dashboard anytime here:<br><a href="{{dashboard_link}}">{{dashboard_link}}</a></p>
<p>If you need anything at all, just reply to this email.</p>
<p>Welcome aboard!</p>
<p>– The T2MS Team<br><a href="mailto:support@t2ms.biz">support@t2ms.biz</a></p>
`.trim();

const BODY_TEXT = `
Hi {{first_name}},

Great news — your T2MS widget is now live on:
{{website_url}}

To update your website, simply text your message from your verified phone number to:
📱 424-484-8267

Your message will publish instantly to your site.

You can log in to your dashboard anytime here:
{{dashboard_link}}

If you need anything at all, just reply to this email.

Welcome aboard!

– The T2MS Team
support@t2ms.biz
`.trim();

export interface WidgetLiveTemplateVars {
  first_name: string;
  website_url: string;
  dashboard_link: string;
}

export function renderWidgetLiveEmail(vars: WidgetLiveTemplateVars) {
  const v = vars as unknown as Record<string, unknown>;
  return {
    subject: WIDGET_LIVE_SUBJECT,
    preheader: WIDGET_LIVE_PREHEADER,
    html: wrapHtml(renderTemplate(BODY_HTML, v), WIDGET_LIVE_PREHEADER),
    text: renderTemplate(BODY_TEXT, v),
  };
}
