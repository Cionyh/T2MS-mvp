import { getHostedPageDomain } from "@/lib/hosted-page/constants";

function getSignupUrl() {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  return base ? `${base}/signup` : "/signup";
}

export default function AnnounceLandingPage() {
  const signupUrl = getSignupUrl();
  const hostedDomain = getHostedPageDomain();

  return (
    <div className="announce-landing">
      <header className="announce-nav">
        <a className="announce-brand" href="#start">
          <span className="announce-brand-mark">T2</span>
          <span>Text2MySite</span>
        </a>
        <nav className="announce-nav-links" aria-label="Main navigation">
          <a href="#tools">What&apos;s Included</a>
          <a href="#how">How It Works</a>
          <a href="#examples">Examples</a>
          <a className="announce-nav-cta" href={signupUrl}>
            Get Started
          </a>
        </nav>
      </header>

      <main>
        <section className="announce-hero">
          <div>
            <div className="announce-eyebrow">
              <span className="announce-pulse" />
              Live Announcement Pages + Website Widget
            </div>
            <h1>
              Keep people informed —{" "}
              <span className="announce-gradient-text">directly from your phone.</span>
            </h1>
            <p className="announce-hero-copy">
              Text2MySite gives you a live announcement page that can be updated
              instantly by text message. No website editing. No login headaches.
              No waiting on a webmaster. If you can send a text, you can update
              your page.
            </p>

            <div className="announce-hero-actions">
              <a href={signupUrl} className="announce-btn announce-btn-primary">
                Start Your Announcement Page →
              </a>
              <a href="#tools" className="announce-btn announce-btn-secondary">
                See What&apos;s Included
              </a>
            </div>

            <div className="announce-mini-proof">
              <span>For businesses</span>
              <span>Churches</span>
              <span>Schools</span>
              <span>Nonprofits</span>
              <span>Community groups</span>
            </div>
          </div>

          <div
            className="announce-phone-stage"
            aria-label="Text message to webpage preview"
          >
            <div className="announce-orb announce-orb-one" />
            <div className="announce-orb announce-orb-two" />

            <div className="announce-mock-card">
              <div className="announce-mock-screen">
                <div className="announce-mock-top">
                  <span>{hostedDomain}</span>
                  <span className="announce-mock-live">LIVE</span>
                </div>

                <div className="announce-preview">
                  <h3>Your Live Announcement Page</h3>
                  <p>Updated instantly from your phone.</p>
                </div>

                <div className="announce-sms-bubble">
                  <span className="announce-bubble-icon">🚚</span>
                  <span>
                    Today&apos;s location:
                    <br />
                    Venice Beach
                    <br />
                    11AM – 3PM
                  </span>
                </div>

                <div className="announce-update-arrow">↓</div>

                <div className="announce-webpage-card">
                  <small>Now Showing</small>
                  <h4>
                    Today&apos;s location:
                    <br />
                    Venice Beach 11AM – 3PM
                  </h4>
                  <p>Come find us for great food and good vibes!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tools" className="announce-section">
          <div className="announce-section-heading">
            <h2>
              One subscription.{" "}
              <span className="announce-gradient-text">Two powerful tools.</span>
            </h2>
            <p>
              Every Text2MySite subscription includes both a hosted announcement
              page and a website widget, giving customers flexibility whether
              they already have a website or need a simple standalone page.
            </p>
          </div>

          <div className="announce-tools-wrap">
            <div className="announce-tool-card">
              <div className="announce-tool-icon">▣</div>
              <h3>Hosted Announcement Page</h3>
              <p>
                A simple, professional webpage that lives online and displays
                your latest updates, notices, alerts, schedule changes, and
                special announcements.
              </p>
            </div>

            <div className="announce-plus">+</div>

            <div className="announce-tool-card">
              <div className="announce-tool-icon">☰</div>
              <h3>Website Widget</h3>
              <p>
                Add the same instant-update power to your existing website using
                a banner, popup, ticker, modal, or fullscreen announcement
                experience.
              </p>
            </div>
          </div>
        </section>

        <section id="how" className="announce-section">
          <div className="announce-section-heading">
            <h2>Simple enough for anyone to use.</h2>
            <p>
              Text2MySite is designed for real-world users who need to communicate
              quickly, without learning web tools or waiting for technical help.
            </p>
          </div>

          <div className="announce-steps">
            <div className="announce-step">
              <div className="announce-step-num">1</div>
              <h3>Send a text message</h3>
              <p>
                Type the update from your phone just like you would text a
                friend or team member.
              </p>
            </div>

            <div className="announce-step">
              <div className="announce-step-num">2</div>
              <h3>Your page updates</h3>
              <p>
                Your live announcement page and/or website widget reflects the
                new message.
              </p>
            </div>

            <div className="announce-step">
              <div className="announce-step-num">3</div>
              <h3>People stay informed</h3>
              <p>
                Customers, members, visitors, staff, and community contacts get
                the latest information fast.
              </p>
            </div>
          </div>
        </section>

        <section id="examples" className="announce-section">
          <div className="announce-section-heading">
            <h2>
              Real updates. Real situations.{" "}
              <span className="announce-gradient-text">Instant clarity.</span>
            </h2>
            <p>
              Text2MySite is not really about websites. It is about communication
              when timing matters.
            </p>
          </div>

          <div className="announce-examples">
            <div className="announce-example">
              <strong>Hair Stylist</strong>
              <p>“Running 20 minutes behind today.”</p>
            </div>

            <div className="announce-example">
              <strong>Church</strong>
              <p>“Bible study moved to Fellowship Hall tonight.”</p>
            </div>

            <div className="announce-example">
              <strong>Food Truck</strong>
              <p>“Today&apos;s location: Venice Beach 11AM–3PM.”</p>
            </div>

            <div className="announce-example">
              <strong>Contractor</strong>
              <p>“Office closed Friday for training.”</p>
            </div>

            <div className="announce-example">
              <strong>Community Group</strong>
              <p>“Meeting postponed due to weather.”</p>
            </div>

            <div className="announce-example">
              <strong>Workshop Host</strong>
              <p>“New workshop dates now available.”</p>
            </div>
          </div>

          <div className="announce-audiences">
            <span>Small businesses</span>
            <span>Churches</span>
            <span>Schools</span>
            <span>Nonprofits</span>
            <span>Outreach campaigns</span>
            <span>Service providers</span>
          </div>
        </section>

        <section id="start" className="announce-section">
          <div className="announce-cta-panel">
            <h2>
              Your announcement page can go live without touching your website.
            </h2>
            <p>
              Create a clean, mobile-friendly page your audience can check
              anytime — then update it instantly by text message whenever plans
              change.
            </p>
            <a href={signupUrl} className="announce-btn announce-btn-primary">
              Launch My Announcement Page →
            </a>
          </div>
        </section>
      </main>

      <footer className="announce-footer">
        <div>© Text2MySite. All rights reserved.</div>
        <div>
          Live Announcement Pages • Website Widgets • Text-to-Update Simplicity
        </div>
      </footer>
    </div>
  );
}
