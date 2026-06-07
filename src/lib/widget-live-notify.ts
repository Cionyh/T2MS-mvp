import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendgrid";
import { renderWidgetLiveEmail } from "@/lib/email-templates";

/**
 * Notify the customer that their widget is live. Call after the install job is COMPLETED.
 * No-ops if customer email or a displayable site URL is missing.
 */
export async function sendWidgetLiveEmailForJob(jobId: string): Promise<void> {
  const jobWithUser = await prisma.installJob.findUnique({
    where: { id: jobId },
    include: {
      customer: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
      client: { select: { domain: true } },
    },
  });

  const user = jobWithUser?.customer?.user;
  const websiteUrl =
    jobWithUser?.client?.domain ??
    (Array.isArray(jobWithUser?.websiteUrls) && jobWithUser.websiteUrls.length > 0
      ? jobWithUser.websiteUrls[0]
      : "");

  if (!user?.email || !websiteUrl) {
    console.warn("[sendWidgetLiveEmailForJob] skipped: missing customer email or site URL", {
      jobId,
      hasEmail: Boolean(user?.email),
      hasUrl: Boolean(websiteUrl),
    });
    return;
  }

  const dashboardLink =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const firstName = (user.name ?? "").trim().split(/\s+/)[0] || "there";
  const { subject, html, text } = renderWidgetLiveEmail({
    first_name: firstName,
    website_url: websiteUrl,
    dashboard_link: dashboardLink,
  });

  await sendEmail({ to: user.email, subject, html, text });
}
