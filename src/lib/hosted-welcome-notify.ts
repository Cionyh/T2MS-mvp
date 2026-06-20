import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendgrid";
import { renderWelcomeHostedEmail } from "@/lib/email-templates";
import { getHostedPageDomain } from "@/lib/hosted-page/constants";
import { getT2msSmsDisplayNumber, getSmsFormatExample } from "@/lib/sms-display";
import { getOrganizationPlan } from "@/lib/plan-limits";

/**
 * Send the hosted-page welcome email once per client when the page is first published.
 * Idempotent — no-ops if already sent, page not live, or user email missing.
 */
export async function sendHostedWelcomeEmailForClient(
  clientId: string,
  userId: string
): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      name: true,
      hostedSlug: true,
      hostedEnabled: true,
      hostedWelcomeEmailSentAt: true,
      keyword: true,
      organizationId: true,
    },
  });

  if (
    !client?.hostedEnabled ||
    !client.hostedSlug ||
    client.hostedWelcomeEmailSentAt
  ) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    console.warn("[sendHostedWelcomeEmailForClient] skipped: no user email", {
      clientId,
      userId,
    });
    return;
  }

  const lock = await prisma.client.updateMany({
    where: { id: clientId, hostedWelcomeEmailSentAt: null },
    data: { hostedWelcomeEmailSentAt: new Date() },
  });

  if (lock.count === 0) {
    return;
  }

  const dashboardLink =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const domain = getHostedPageDomain();
  const hostedPageUrl = `https://${client.hostedSlug}.${domain}`;
  const firstName = (user.name ?? "").trim().split(/\s+/)[0] || "there";

  const plan = client.organizationId
    ? await getOrganizationPlan(client.organizationId)
    : "starter";
  const keywordForExample =
    plan === "pro" || plan === "enterprise" ? client.keyword : null;

  const { subject, html, text } = renderWelcomeHostedEmail({
    first_name: firstName,
    site_name: client.name,
    hosted_page_url: hostedPageUrl,
    text_number: getT2msSmsDisplayNumber(),
    sms_format_example: getSmsFormatExample(keywordForExample),
    dashboard_link: dashboardLink,
  });

  try {
    await sendEmail({ to: user.email, subject, html, text });
  } catch (err) {
    await prisma.client.update({
      where: { id: clientId },
      data: { hostedWelcomeEmailSentAt: null },
    });
    throw err;
  }
}
