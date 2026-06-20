import { renderTemplate, wrapHtml } from "./render";

export const WIDGET_ACTIVATION_SUBJECT =
  "Next step: allow widget installation on your site";
export const WIDGET_ACTIVATION_PREHEADER =
  "Add our installer to your website platform to go live.";

const BODY_HTML = `
<p>Hi {{first_name}},</p>
<p>Thanks for choosing the <strong>website widget</strong> path with Text2MySite™!</p>
<p><strong>Your next step</strong> — add our installer to your website platform so we can place the widget:</p>
<ul>
<li><strong>Email:</strong> install@t2ms.biz</li>
<li><strong>Name:</strong> Text To My Site Installer</li>
</ul>
<p>In your platform, search for &quot;add user&quot;, &quot;add collaborator&quot;, or &quot;add administrator&quot; — or ask your web admin to invite <strong>install@t2ms.biz</strong>.</p>
<p>Once access is granted, our team installs the widget (usually within 24 hours). You will receive another email when your widget is live.</p>
<p><strong>After your widget is live</strong>, post updates by texting from your verified number to <strong>{{text_number}}</strong>.</p>
<p><strong>Dashboard</strong> — view install status and platform instructions:<br><a href="{{dashboard_link}}">{{dashboard_link}}</a></p>
<p>Questions? Reply to this email or contact <a href="mailto:support@t2ms.biz">support@t2ms.biz</a>.</p>
<p>– The T2MS Team</p>
`.trim();

const BODY_TEXT = `
Hi {{first_name}},

Thanks for choosing the website widget path with Text2MySite™!

Your next step — add our installer to your website platform so we can place the widget:

  Email: install@t2ms.biz
  Name: Text To My Site Installer

In your platform, search for "add user", "add collaborator", or "add administrator" — or ask your web admin to invite install@t2ms.biz.

Once access is granted, our team installs the widget (usually within 24 hours). You will receive another email when your widget is live.

After your widget is live, post updates by texting from your verified number to {{text_number}}.

Dashboard — view install status and platform instructions:
{{dashboard_link}}

Questions? Contact support@t2ms.biz.

– The T2MS Team
`.trim();

export interface WidgetActivationTemplateVars {
  first_name: string;
  dashboard_link: string;
  text_number: string;
}

export function renderWidgetActivationEmail(vars: WidgetActivationTemplateVars) {
  const v = vars as unknown as Record<string, unknown>;
  return {
    subject: WIDGET_ACTIVATION_SUBJECT,
    preheader: WIDGET_ACTIVATION_PREHEADER,
    html: wrapHtml(renderTemplate(BODY_HTML, v), WIDGET_ACTIVATION_PREHEADER),
    text: renderTemplate(BODY_TEXT, v),
  };
}
