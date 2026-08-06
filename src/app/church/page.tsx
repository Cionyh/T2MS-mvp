import Link from "next/link";
import { ChurchPlanSessionPriming, ChurchTrialLink } from "./church-trial-link";

export default function ChurchPage() {
  return (
    <div className="church-faith-page page">
      <ChurchPlanSessionPriming />
      <header className="topbar">
        <div className="brand">
          TEXT2MYSITE<span>™</span>
        </div>
        <div className="topbar-actions">
          <Link href="/" className="nav-return">
            Return to Main Website
          </Link>
          <ChurchTrialLink className="nav-cta">Start Free Trial</ChurchTrialLink>
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">Church Communications Made Simple</div>
          <h1>Update Church Announcements by Text Message</h1>
          <p>
            Keep your congregation informed when schedules change, events are added, or important
            announcements need to reach your church family quickly.
          </p>

          <div className="simple-list">
            <div>
              <span className="check">✓</span>No website required
            </div>
            <div>
              <span className="check">✓</span>No website editing
            </div>
            <div>
              <span className="check">✓</span>No technical experience required
            </div>
          </div>

          <p>
            <strong>If you can send a text message, you can update your church announcements.</strong>
          </p>

          <div className="cta-row">
            <ChurchTrialLink className="btn">Start Free Trial</ChurchTrialLink>
            <a className="btn secondary" href="#how">
              See How It Works
            </a>
          </div>
        </div>

        <div className="hero-card">
          <div className="phone">
            <div className="phone-screen">
              <span className="live-badge">LIVE UPDATE</span>
              <div className="church-card">
                <h3>Greater Hope Church</h3>
                <p>
                  <strong>Sunday Service Update</strong>
                  <br />
                  Join us at 10:00 AM for worship. Youth choir rehearsal follows immediately after
                  service.
                </p>
              </div>
              <div className="church-card">
                <h3>Community Outreach</h3>
                <p>Food pantry volunteers are needed Saturday from 9:00 AM to 12:00 PM.</p>
              </div>
              <div className="ticker">Tonight: Bible Study begins at 7:00 PM</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="section-title">
          <h2>How It Works</h2>
          <p>
            Three simple steps help your church publish timely announcements without waiting on a
            webmaster.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="num">1</div>
            <h3>Create Your Church Account</h3>
            <p>Set up your church in just a few minutes.</p>
          </div>
          <div className="step">
            <div className="num">2</div>
            <h3>Send a Text Message</h3>
            <p>Send your announcement from your phone.</p>
          </div>
          <div className="step">
            <div className="num">3</div>
            <h3>Your Announcement Appears Online</h3>
            <p>Members can immediately view the latest information.</p>
          </div>
        </div>
      </section>

      <section className="soft">
        <div className="section-title">
          <h2>Two Ways To Share Updates</h2>
          <p>Use a dedicated announcement page, a website widget, or both.</p>
        </div>

        <div className="options">
          <div className="option">
            <div className="option-icon">📣</div>
            <h3>Hosted Announcement Page</h3>
            <p>
              Every church receives a hosted announcement page that can be shared by email, text
              message, social media, QR code, church bulletins, or other communication channels.
            </p>
            <p>
              Perfect for churches that do not have a website or want a dedicated announcements
              page.
            </p>
          </div>

          <div className="option">
            <div className="option-icon">🌐</div>
            <h3>Website Widget</h3>
            <p>
              Already have a church website? Add the Text2MySite widget and display announcements
              directly on your existing website.
            </p>
            <p>Send a text message and your updates appear automatically on your website.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="split">
          <div className="callout">
            <h2>Designed For Churches</h2>
            <p>
              Many churches rely on volunteers, outdated website systems, or busy staff members to
              post announcements.
            </p>
            <p>
              Text2MySite helps simplify communication by allowing churches to publish updates by
              text message.
            </p>
            <div className="mini-checks">
              <div>
                <span className="check">✓</span>No webmaster required
              </div>
              <div>
                <span className="check">✓</span>No website editing experience required
              </div>
              <div>
                <span className="check">✓</span>No waiting for someone else to make the update
              </div>
            </div>
          </div>

          <div>
            <div className="section-title" style={{ textAlign: "left", margin: "0 0 24px" }}>
              <h2>Perfect For</h2>
              <p>Use Text2MySite for everyday ministry updates and urgent notices.</p>
            </div>

            <div className="perfect-grid">
              <div className="perfect-card">
                <div className="emoji">⛪</div>
                <h3>Sunday Service</h3>
                <p>Service updates and reminders.</p>
              </div>
              <div className="perfect-card">
                <div className="emoji">📅</div>
                <h3>Events</h3>
                <p>Ministry events and activities.</p>
              </div>
              <div className="perfect-card">
                <div className="emoji">🙏</div>
                <h3>Prayer Meetings</h3>
                <p>Prayer calls and gathering notices.</p>
              </div>
              <div className="perfect-card">
                <div className="emoji">📖</div>
                <h3>Bible Studies</h3>
                <p>Class times, links, and changes.</p>
              </div>
              <div className="perfect-card">
                <div className="emoji">🤝</div>
                <h3>Outreach</h3>
                <p>Community events and volunteer needs.</p>
              </div>
              <div className="perfect-card">
                <div className="emoji">⚠️</div>
                <h3>Urgent Notices</h3>
                <p>Weather, closures, and last-minute changes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="soft">
        <div className="section-title">
          <h2>Example Layouts</h2>
          <p>
            Screenshots can be added later. These placeholders show where the visual examples will
            sit.
          </p>
        </div>

        <div className="layouts">
          <div className="layout">
            <div className="mock">
              Hosted Church
              <br />
              Announcement Page
            </div>
            <strong>Hosted Announcement Page</strong>
          </div>
          <div className="layout">
            <div className="mock">
              Website
              <br />
              Banner
            </div>
            <strong>Website Banner</strong>
          </div>
          <div className="layout">
            <div className="mock">
              Scrolling
              <br />
              Ticker
            </div>
            <strong>Website Ticker</strong>
          </div>
          <div className="layout">
            <div className="mock">
              Popup
              <br />
              Announcement
            </div>
            <strong>Website Popup</strong>
          </div>
        </div>
      </section>

      <section className="pricing" id="trial">
        <div className="section-title">
          <h2>Special Church Launch Pricing</h2>
          <p>Simple pricing for churches and faith-based organizations.</p>
        </div>

        <div className="price-card">
          <h3>14-Day Free Trial</h3>
          <div className="price">
            $7.99<small>/month</small>
          </div>
          <p>Pricing locked for up to 3 years for qualifying early church adopters.</p>

          <div className="offer-list">
            <div>✓ 14-Day Free Trial</div>
            <div>✓ No Long-Term Contract</div>
            <div>✓ Hosted Announcement Page</div>
            <div>✓ Website Widget Option</div>
          </div>

          <ChurchTrialLink className="btn">Start Free Trial</ChurchTrialLink>
        </div>
      </section>

      <section className="soft">
        <div className="section-title">
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers for church leaders, administrators, and communication teams.</p>
        </div>

        <div className="faq">
          <details open>
            <summary>Do I need a website?</summary>
            <p>No. Every account includes a hosted announcement page.</p>
          </details>

          <details>
            <summary>Can I use my existing website?</summary>
            <p>
              Yes. Text2MySite can also display updates directly on your current website using a
              widget.
            </p>
          </details>

          <details>
            <summary>Can I update announcements from my phone?</summary>
            <p>Yes. Simply send a text message.</p>
          </details>

          <details>
            <summary>How quickly do updates appear?</summary>
            <p>
              Updates are designed to appear almost immediately after your text message is
              received.
            </p>
          </details>

          <details>
            <summary>Who can send updates?</summary>
            <p>
              Authorized church staff and administrators can send announcements from approved phone
              numbers associated with the account.
            </p>
          </details>
        </div>
      </section>

      <section className="final-cta">
        <h2>Ready To Simplify Church Communications?</h2>
        <p>
          Whether your church has a website or not, Text2MySite helps keep members informed using a
          simple text message.
        </p>
        <ChurchTrialLink className="btn">Start Your Free Trial Today</ChurchTrialLink>
      </section>

      <footer>
        TEXT2MYSITE™ Church Communications ·{" "}
        <a href="mailto:support@t2ms.biz">support@t2ms.biz</a>
        <p className="footer-return">
          <Link href="/">Return to Main Website</Link>
        </p>
      </footer>
    </div>
  );
}
