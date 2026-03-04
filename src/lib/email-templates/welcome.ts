import { renderTemplate, wrapHtml } from "./render";

export const WELCOME_SUBJECT = "Welcome to Text2MySite™";
export const WELCOME_PREHEADER = "Your 14-day free trial has started.";

const BODY_HTML = `
<p>Hi {{first_name}},</p>
<p>Welcome to Text2MySite™!</p>
<p>Your account has been successfully created and your 14-day free trial has started.</p>
<p>We're preparing your installation and will send you simple, step-by-step instructions shortly to grant us access to your website.</p>
<p>You can log in anytime here:<br><a href="{{dashboard_link}}">{{dashboard_link}}</a></p>
<p>We're excited to help you update your website instantly by text.</p>
<p>– The T2MS Team<br><a href="mailto:support@t2ms.biz">support@t2ms.biz</a></p>
`.trim();

const BODY_TEXT = `
Hi {{first_name}},

Welcome to Text2MySite™!

Your account has been successfully created and your 14-day free trial has started.

We're preparing your installation and will send you simple, step-by-step instructions shortly to grant us access to your website.

You can log in anytime here:
{{dashboard_link}}

We're excited to help you update your website instantly by text.

– The T2MS Team
support@t2ms.biz
`.trim();

export interface WelcomeTemplateVars {
  first_name: string;
  dashboard_link: string;
}

export function renderWelcomeEmail(vars: WelcomeTemplateVars) {
  const v = vars as unknown as Record<string, unknown>;
  return {
    subject: WELCOME_SUBJECT,
    preheader: WELCOME_PREHEADER,
    html: wrapHtml(renderTemplate(BODY_HTML, v), WELCOME_PREHEADER),
    text: renderTemplate(BODY_TEXT, v),
  };
}
