"use client";

import Link from "next/link";
import {
  ChurchPlanSessionPriming,
  ChurchTrialLink,
} from "@/app/church/church-trial-link";
import {
  getChurchIntroPriceLabel,
  isChurchPlanEnabled,
} from "@/lib/church-pricing";
import { CHURCH_PLAN_FEATURES } from "@/lib/plan-features";

export default function ChurchPricingPage() {
  const priceLabel = getChurchIntroPriceLabel();
  const enabled = isChurchPlanEnabled();

  return (
    <div className="church-pricing-page">
      <ChurchPlanSessionPriming />
      <div className="cp-wrap">
        <header className="cp-top">
          <Link href="/church-page-announcements" className="cp-brand">
            Text2MySite<span>™</span> for Churches
          </Link>
          <nav className="cp-nav" aria-label="Church pricing">
            <Link href="/church-page-announcements" className="cp-link">
              Church homepage
            </Link>
            <Link href="/" className="cp-btn cp-btn-ghost">
              Main website
            </Link>
          </nav>
        </header>

        <main>
          <section className="cp-hero">
            <p className="cp-eyebrow">Church Partner Program</p>
            <h1>Special pricing for churches</h1>
            <p className="cp-lead">
              Update announcements by text — no webmaster required. Introducing
              locked-in intro pricing for verified churches and religious
              organizations.
            </p>
          </section>

          <article className="cp-card" aria-labelledby="church-plan-title">
            <span className="cp-badge">Campaign exclusive</span>
            <h2 id="church-plan-title" className="cp-plan-name">
              Church Partner
            </h2>
            <p className="cp-plan-desc">
              One site with a hosted announcement page and optional website
              widget — built for pastoral teams who need simple, fast updates.
            </p>

            {enabled ? (
              <>
                <div className="cp-price">
                  <span className="cp-price-amount">{priceLabel}</span>
                  <span className="cp-price-period">/month</span>
                </div>
                <p className="cp-price-note">
                  14-day free trial. Cancel anytime. Intro rate locked for up
                  to 3 years for qualifying early church adopters.
                </p>
              </>
            ) : (
              <p className="cp-price-note">
                Church Partner pricing is temporarily unavailable. Please
                contact{" "}
                <a href="mailto:sales@t2ms.biz" className="cp-link">
                  sales@t2ms.biz
                </a>
                .
              </p>
            )}

            <ul className="cp-features">
              {CHURCH_PLAN_FEATURES.map((feature) => (
                <li key={feature}>
                  <span className="cp-check" aria-hidden>
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="cp-cta-row">
              {enabled ? (
                <ChurchTrialLink className="cp-btn cp-btn-primary">
                  Start free 14-day trial
                </ChurchTrialLink>
              ) : (
                <a
                  href="mailto:sales@t2ms.biz"
                  className="cp-btn cp-btn-primary"
                >
                  Contact sales
                </a>
              )}
            </div>
            <p className="cp-fine">
              Eligibility may require a short church verification before
              checkout. No long-term contracts.
            </p>
          </article>

          <aside className="cp-aside">
            <p>
              Looking for standard business plans? See the main pricing on our
              website, or return to the church announcements overview.
            </p>
            <div className="cp-nav" style={{ justifyContent: "center" }}>
              <Link href="/#pricing" className="cp-btn cp-btn-ghost">
                Business pricing
              </Link>
              <Link
                href="/church-page-announcements"
                className="cp-btn cp-btn-ghost"
              >
                Back to church funnel
              </Link>
            </div>
          </aside>
        </main>

        <footer className="cp-footer">
          <span>© {new Date().getFullYear()} Text2MySite™ for Churches</span>
          <div className="cp-nav">
            <Link href="/legal/privacy" className="cp-link">
              Privacy
            </Link>
            <Link href="/legal/terms" className="cp-link">
              Terms
            </Link>
            <a href="mailto:support@t2ms.biz" className="cp-link">
              Support
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
