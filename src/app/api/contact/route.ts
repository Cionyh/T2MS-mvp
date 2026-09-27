import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendgrid";
import { escapeHtmlText } from "@/lib/rich-text";
import { CONTACT_EMAIL, validateContactSubmission } from "@/lib/contact-form";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Please check your information and try again." },
      { status: 400 }
    );
  }

  // Honeypot: respond as if accepted so bots get no useful signal.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const result = validateContactSubmission(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { name, business, email, phone, reason, subject, message } = result.data;
  const submittedAt = new Date().toISOString();

  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Business / Organization", business || "Not provided"],
    ["Email", email],
    ["Phone", phone || "Not provided"],
    ["Reason", reason],
    ["Subject", subject],
  ];

  const text = [
    "New Text2MySite™ website contact submission",
    "==================================================",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    message,
    "",
    "--------------------------------------------------",
    `Submitted: ${submittedAt}`,
    "Source: Text2MySite™ website contact form",
  ].join("\n");

  const html = `
<h2>New Text2MySite™ website contact submission</h2>
<table cellpadding="4" style="border-collapse:collapse">
${rows
  .map(
    ([label, value]) =>
      `<tr><td><strong>${escapeHtmlText(label)}:</strong></td><td>${escapeHtmlText(value)}</td></tr>`
  )
  .join("\n")}
</table>
<p><strong>Message:</strong></p>
<p style="white-space:pre-wrap">${escapeHtmlText(message)}</p>
<hr />
<p style="color:#666;font-size:12px">Submitted: ${submittedAt}<br />Source: Text2MySite™ website contact form</p>`;

  try {
    await sendEmail({
      to: CONTACT_EMAIL,
      subject: `[T2MS Contact] ${reason} — ${subject}`,
      html,
      text,
      replyTo: email,
    });
  } catch {
    return NextResponse.json(
      {
        error: `We could not send your message at this time. Please email ${CONTACT_EMAIL} directly.`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
