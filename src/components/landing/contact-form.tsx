"use client";

import { FormEvent, useState } from "react";
import { CONTACT_EMAIL, CONTACT_LIMITS, CONTACT_REASONS } from "@/lib/contact-form";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent" }
  | { state: "error"; message: string };

const inputClass =
  "w-full rounded-[9px] border border-[#29364a] bg-white px-3.5 py-3 text-[#172033] outline-none focus:border-[#ff6600] focus:ring-[3px] focus:ring-[#ff6600]/20";

const labelClass = "mb-1.5 block text-sm font-bold";

function Required() {
  return <span className="text-[#ff6600]">*</span>;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({
          state: "error",
          message:
            data.error ??
            `We could not send your message at this time. Please email ${CONTACT_EMAIL} directly.`,
        });
        return;
      }
      form.reset();
      setStatus({ state: "sent" });
    } catch {
      setStatus({
        state: "error",
        message: `We could not send your message at this time. Please email ${CONTACT_EMAIL} directly.`,
      });
    }
  }

  return (
    <section
      aria-labelledby="contact-title"
      className="rounded-[18px] border border-[#29364a] bg-[#0d1727] p-7 text-white shadow-[0_18px_55px_rgba(0,0,0,.28)] sm:p-10"
    >
      <div className="mb-8 text-center">
        <h1
          id="contact-title"
          className="mb-2 font-serif text-[clamp(32px,6vw,48px)] font-semibold tracking-tight"
        >
          Text2MySite<span className="text-[#ff6600]">™</span>
        </h1>
        <p className="leading-relaxed text-[#aeb8c7]">
          Have a question? Send us a message and the appropriate T2MS team member can follow up.
        </p>
      </div>

      {status.state === "sent" ? (
        <div role="status" className="text-center">
          <h2 className="mb-4 font-serif text-3xl">Message Sent</h2>
          <p className="leading-relaxed text-[#c1c9d5]">
            Thank you for contacting Text2MySite™. Your message has been received and a member of
            our team can follow up.
          </p>
          <button
            type="button"
            onClick={() => setStatus({ state: "idle" })}
            className="mt-6 cursor-pointer rounded-full bg-[#ff6600] px-6 py-3 font-bold text-white transition-transform hover:-translate-y-px"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>
                Name <Required />
              </label>
              <input
                id="name"
                name="name"
                type="text"
                maxLength={CONTACT_LIMITS.name}
                autoComplete="name"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="business" className={labelClass}>
                Business / Organization
              </label>
              <input
                id="business"
                name="business"
                type="text"
                maxLength={CONTACT_LIMITS.business}
                autoComplete="organization"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email <Required />
              </label>
              <input
                id="email"
                name="email"
                type="email"
                maxLength={CONTACT_LIMITS.email}
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                maxLength={CONTACT_LIMITS.phone}
                autoComplete="tel"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="reason" className={labelClass}>
                How can we help? <Required />
              </label>
              <select id="reason" name="reason" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Select one
                </option>
                {CONTACT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="subject" className={labelClass}>
                Subject <Required />
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                maxLength={CONTACT_LIMITS.subject}
                required
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className={labelClass}>
                Message <Required />
              </label>
              <textarea
                id="message"
                name="message"
                maxLength={CONTACT_LIMITS.message}
                required
                className={`${inputClass} min-h-[155px] resize-y`}
              />
            </div>
          </div>

          {/* Anti-spam honeypot. Human visitors should never fill this field. */}
          <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
            <label htmlFor="website">Leave this field blank</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          {status.state === "error" && (
            <p role="alert" className="mt-5 text-center text-sm text-[#ff8a3d]">
              {status.message}
            </p>
          )}

          <div className="mt-[22px] text-center">
            <button
              type="submit"
              disabled={status.state === "sending"}
              className="cursor-pointer rounded-full bg-[#ff6600] px-8 py-3 text-base font-extrabold text-white transition-transform hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status.state === "sending" ? "Sending…" : "Send Message"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-[18px] text-center text-[13px] leading-normal text-[#aeb8c7]">
        You may also contact us directly at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#ff6600] no-underline hover:underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <div className="mt-7 text-center font-serif text-lg italic">Text it. Send it. Done.</div>
    </section>
  );
}
