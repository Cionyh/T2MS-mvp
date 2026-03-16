"use client";

/**
 * Shared instruction block for the simplified Install Setup flow.
 * Shown on onboarding install step and install-request setup step.
 */
export function InstallSetupInstructions() {
  return (
    <div className="space-y-4 text-sm text-foreground">
      <p>You&apos;re almost ready to start using Text2MySite™!</p>
      <p>
        To install your widget, we simply need temporary access to your website platform so our installer can place the widget for you.
      </p>
      <p>This is very easy and usually takes less than a minute.</p>
      <p>You just need to add the following user to your website platform:</p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li><strong>Email:</strong> install@t2ms.biz</li>
        <li><strong>Name:</strong> Text To My Site Installer</li>
      </ul>
      <p>
        If someone else manages your website, you can also ask your website administrator, developer, or hosting provider to add us for you.
      </p>
      <p>Most customers are using one of these platforms:</p>
      <ul className="list-disc list-inside ml-2 space-y-0.5">
        <li>WordPress</li>
        <li>Wix</li>
        <li>Squarespace</li>
        <li>Shopify</li>
        <li>Webflow</li>
        <li>Joomla</li>
        <li>SiteGround / Hosting Provider</li>
      </ul>
      <p>Log into your platform and use the search bar to search for:</p>
      <ul className="list-disc list-inside ml-2 space-y-0.5">
        <li>&quot;How to add user&quot;</li>
        <li>&quot;How to add collaborator&quot;</li>
        <li>&quot;How to add administrator&quot;</li>
      </ul>
      <p>If you are having trouble finding the setting, you can also search Google for:</p>
      <p className="font-medium">&quot;How to add a user in (your platform)&quot;</p>
      <p>
        Once access is granted, our highly trained installers will complete the installation and your widget will be ready to use.
      </p>
      <p>Most installations are completed within 24 hours after access is granted.</p>
    </div>
  );
}
