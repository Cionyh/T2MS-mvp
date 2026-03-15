import { renderTemplate, wrapHtml } from "./render";

export const WELCOME_SUBJECT = "Welcome to Text2MySite™";
export const WELCOME_PREHEADER = "Your 14-day free trial has started. You're about 80% complete.";

const BODY_HTML = `
<p>Hi {{first_name}},</p>
<p>Welcome to Text2MySite™!</p>
<p>Your 14-day free trial has started.</p>
<p><strong>You're about 80% complete.</strong> To finish setup, we need temporary access to your website platform so our installer can place the widget for you.</p>
<p><strong>Add this user to your website platform:</strong></p>
<ul>
<li><strong>Email:</strong> install@t2ms.biz</li>
<li><strong>Name:</strong> Text To My Site Installer</li>
</ul>
<p>If someone else manages your website, you can ask your website administrator, developer, or hosting provider to add us for you.</p>
<p><strong>In your platform's search bar, try searching for:</strong></p>
<ul>
<li>"How to add user"</li>
<li>"How to add collaborator"</li>
<li>"How to add administrator"</li>
</ul>
<p>If you have trouble finding the setting, search Google for:</p>
<p>"How to add a user in (your platform)"</p>
<p>Our installers will only use the access to install the widget and will remove the access immediately after installation is complete.</p>
<p>Our highly trained installers will complete the installation once access is granted. Most installations are completed within 24 hours after access is granted.</p>
<p>You can log in anytime here:<br><a href="{{dashboard_link}}">{{dashboard_link}}</a></p>
<p>– The T2MS Team<br><a href="mailto:support@t2ms.biz">support@t2ms.biz</a></p>
`.trim();

const BODY_TEXT = `
Hi {{first_name}},

Welcome to Text2MySite™!

Your 14-day free trial has started.

You're about 80% complete. To finish setup, we need temporary access to your website platform so our installer can place the widget for you.

Add this user to your website platform:

  Email: install@t2ms.biz
  Name: Text To My Site Installer

If someone else manages your website, you can ask your website administrator, developer, or hosting provider to add us for you.

In your platform's search bar, try searching for:

  "How to add user"
  "How to add collaborator"
  "How to add administrator"

If you have trouble finding the setting, search Google for:

  "How to add a user in (your platform)"

Our installers will only use the access to install the widget and will remove the access immediately after installation is complete.

Our highly trained installers will complete the installation once access is granted. Most installations are completed within 24 hours after access is granted.

You can log in anytime here:
{{dashboard_link}}

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
