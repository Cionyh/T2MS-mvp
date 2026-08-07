"use client";

import { useEffect } from "react";
import {
  ChurchPlanSessionPriming,
  ChurchTrialLink,
} from "@/app/church/church-trial-link";

export default function ChurchAnnouncementPage() {
  useEffect(() => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const demoMessage =
      "Tonight's Bible Study has been canceled due to weather. " +
      "See everyone Sunday morning!";

    const typedMessage = document.getElementById("typedMessage");
    const websiteMessage = document.getElementById("siteMessage");
    const sentConfirmation = document.getElementById("sent");
    const statusItems = [
      ...document.querySelectorAll(".church-funnel-page .status"),
    ];
    const sendButton = document.getElementById("sendButton");

    if (!typedMessage || !websiteMessage || !sentConfirmation || !sendButton) {
      return;
    }

    let demoIsRunning = false;
    let cancelled = false;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    async function runDemo() {
      if (demoIsRunning || cancelled) return;
      demoIsRunning = true;

      typedMessage!.textContent = "";
      sentConfirmation!.classList.remove("show");
      statusItems.forEach((item) => item.classList.remove("active"));
      websiteMessage!.textContent =
        "Sunday worship begins at 10:00 AM. We look forward to seeing you!";

      for (const character of demoMessage) {
        if (cancelled) return;
        typedMessage!.textContent += character;
        await wait(character === " " ? 28 : 42);
      }

      await wait(450);
      if (cancelled) return;
      sentConfirmation!.classList.add("show");

      await wait(500);
      if (cancelled) return;
      websiteMessage!.textContent = demoMessage;

      for (const statusItem of statusItems) {
        if (cancelled) return;
        await wait(340);
        statusItem.classList.add("active");
      }

      await wait(3500);
      demoIsRunning = false;
      if (!cancelled) void runDemo();
    }

    const onSend = () => {
      demoIsRunning = false;
      void runDemo();
    };
    sendButton.addEventListener("click", onSend);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!reduceMotion) {
      void runDemo();
    } else {
      typedMessage.textContent = demoMessage;
      websiteMessage.textContent = demoMessage;
      sentConfirmation.classList.add("show");
      statusItems.forEach((item) => item.classList.add("active"));
    }

    const faqButtons = document.querySelectorAll(
      ".church-funnel-page .faq-button"
    );
    const faqHandlers: Array<[Element, EventListener]> = [];
    faqButtons.forEach((button) => {
      const handler: EventListener = () => {
        const faqItem = button.closest(".faq-item");
        if (!faqItem) return;
        const isOpen = faqItem.classList.toggle("open");
        button.setAttribute("aria-expanded", String(isOpen));
      };
      button.addEventListener("click", handler);
      faqHandlers.push([button, handler]);
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
          }
        });
      },
      { threshold: 0.13 }
    );
    document
      .querySelectorAll(".church-funnel-page .reveal")
      .forEach((el) => revealObserver.observe(el));

    return () => {
      cancelled = true;
      sendButton.removeEventListener("click", onSend);
      faqHandlers.forEach(([button, handler]) =>
        button.removeEventListener("click", handler)
      );
      revealObserver.disconnect();
    };
  }, []);

  return (
    <div className="church-funnel-page">
      <ChurchPlanSessionPriming />
<a className="skip" href="#main">
   Skip to content
  </a>
  
  <header className="topbar">
   <div className="container nav">
    <a aria-label="Text2MySite for Churches home" className="brand" href="#top">
     <span className="brand-mark">
      ✚
     </span>
     <span>
      Text2MySite™
      <small>
       for Churches
      </small>
     </span>
    </a>
    <nav aria-label="Main navigation" className="navlinks">
     <a href="#how">
      How It Works
     </a>
     <a href="#options">
      Church Options
     </a>
     <a href="/church-pricing">
      Pricing
     </a>
     <a href="#faq">
      FAQ
     </a>
     <ChurchTrialLink className="btn btn-primary btn-nav">Start Free Trial</ChurchTrialLink>
    </nav>
   </div>
  </header>
  <main id="main">
   
   <section className="hero" id="top">
    <div className="container hero-grid">
     <div className="hero-copy">
      <h1>
       Church announcements
       <span>
        —as easy as sending a text.
       </span>
      </h1>
      <p className="lead">
       Keep your congregation informed instantly—without logging into your website, waiting on a webmaster, or learning complicated software.
      </p>
      <div className="trust-row">
       <div className="trust">
        <span className="trust-icon">
         ▭
        </span>
        Pricing locked for up to three years for qualifying early church adopters
       </div>
       <div className="trust">
        <span className="trust-icon">
         ◷
        </span>
        Setup takes about 10 minutes
       </div>
       <div className="trust">
        <span className="trust-icon">
         ♙
        </span>
        Special Church Partner pricing
       </div>
      </div>
      <ChurchTrialLink className="btn btn-primary">Start My Free 14-Day Trial
       <span>
        →
       </span></ChurchTrialLink>
      <div className="hand-note">
       ↖ Get started in minutes!
      </div>
     </div>
     <div aria-label="Animated demonstration of a text message updating a church website" className="demo">
      <div className="laptop">
       <div className="screen">
        <div className="sitebar">
         <div className="sitebrand">
          <span className="cross">
           †
          </span>
          Grace Community Church
         </div>
         <div className="sitenav">
          <span>
           HOME
          </span>
          <span>
           ABOUT
          </span>
          <span>
           MINISTRIES
          </span>
          <span>
           EVENTS
          </span>
          <span>
           GIVE
          </span>
          <span>
           CONTACT
          </span>
         </div>
        </div>
        <div className="church-scene">
         <div className="announce-card">
          <div className="announce-label">
           📣 Important Announcement
          </div>
          <div className="announce-text" id="siteMessage">
           Sunday worship begins at 10:00 AM. We look forward to seeing you!
          </div>
          <span className="mini-btn">
           LEARN MORE
          </span>
         </div>
         <div className="site-actions">
          <div className="site-action">
           ▣ Watch Online
          </div>
          <div className="site-action">
           ♬ Sermons
          </div>
          <div className="site-action">
           ▦ Events
          </div>
          <div className="site-action">
           ♡ Give
          </div>
         </div>
        </div>
       </div>
      </div>
      <div className="phone">
       <div className="phone-notch">
       </div>
       <div className="phone-inner">
        <div className="phone-title">
         New Message
        </div>
        <div className="to">
         To: Text2MySite
        </div>
        <div className="label">
         Church Announcement
        </div>
        <div className="message-box">
         <span id="typedMessage">
         </span>
         <span className="cursor">
         </span>
        </div>
        <button className="send" id="sendButton" type="button">
         SEND ➤
        </button>
        <div className="sent" id="sent">
         ● Message sent!
        </div>
       </div>
      </div>
      <div aria-hidden="true" className="flight">
      </div>
      <div className="status-strip">
       <div className="status">
        <span className="check">
         ✓
        </span>
        Website Updated
       </div>
       <div className="status">
        <span className="check">
         ✓
        </span>
        Announcement Page Updated
       </div>
       <div className="status">
        <span className="check">
         ✓
        </span>
        QR Code Page Updated
       </div>
       <div className="status">
        <span className="check">
         ✓
        </span>
        Congregation Informed
       </div>
      </div>
      <div className="live-note">
       All updates live in seconds.
      </div>
     </div>
    </div>
   </section>
   
   <section className="section" id="how">
    <div className="container">
     <div className="section-head reveal">
      <span className="eyebrow">
       A simpler routine
      </span>
      <h2>
       Before and{" "}
       <span style={{ color: "green" }}>After Text2MySite</span>.
      </h2>
     </div>
     <div className="compare reveal">
      <div className="person">
       <img alt="A frustrated church administrator using a laptop" src="/images/church-announcement/asset-0.jpg"/>
      </div>
      <article className="compare-card">
       <h3>
        Before
       </h3>
       <ul>
        <li>
         <span className="bullet">
          ×
         </span>
         Call or email the webmaster.
        </li>
        <li>
         <span className="bullet">
          ×
         </span>
         Wait for someone to make the update.
        </li>
        <li>
         <span className="bullet">
          ×
         </span>
         Log in and edit several pages.
        </li>
        <li>
         <span className="bullet">
          ×
         </span>
         Hope everyone checks the right place.
        </li>
        <li>
         <span className="bullet">
          ×
         </span>
         Wonder whether members saw it.
        </li>
       </ul>
      </article>
      <article className="compare-card after">
       <h3>
        After
       </h3>
       <ul>
        <li>
         <span className="bullet">
          ✓
         </span>
         Send one text message.
        </li>
        <li>
         <span className="bullet">
          ✓
         </span>
         Your announcement updates automatically.
        </li>
        <li>
         <span className="bullet">
          ✓
         </span>
         Your church sees the latest information.
        </li>
        <li>
         <span className="bullet">
          ✓
         </span>
         Done.
        </li>
       </ul>
      </article>
      <div className="person">
       <img alt="A smiling pastor checking a phone" src="/images/church-announcement/asset-1.jpg"/>
      </div>
     </div>
     <div className="benefits reveal">
      <div className="benefit">
       <div className="benefit-icon">
        ◷
       </div>
       <div>
        <b>
         Save Time
        </b>
        <span>
         Stop logging in and updating your site.
        </span>
       </div>
      </div>
      <div className="benefit">
       <div className="benefit-icon">
        ♙
       </div>
       <div>
        <b>
         Reach Everyone
        </b>
        <span>
         Your message appears where people look.
        </span>
       </div>
      </div>
      <div className="benefit">
       <div className="benefit-icon">
        ♧
       </div>
       <div>
        <b>
         No Tech Skills Needed
        </b>
        <span>
         If you can text, you can do this.
        </span>
       </div>
      </div>
      <div className="benefit">
       <div className="benefit-icon">
        ◎
       </div>
       <div>
        <b>
         With or Without a Website
        </b>
        <span>
         We update your site—or host a page for you.
        </span>
       </div>
      </div>
     </div>
    </div>
   </section>
   
   <section className="section soft">
    <div className="container">
     <div className="section-head reveal">
      <span className="eyebrow">
       Built for everyday ministry
      </span>
      <h2>
       We built Text2MySite for moments like these.
      </h2>
     </div>
     <div className="moments reveal">
      <div className="moment">
       <span className="emoji">
        ⛪
       </span>
       Sunday Worship
      </div>
      <div className="moment">
       <span className="emoji">
        📖
       </span>
       Bible Studies
      </div>
      <div className="moment">
       <span className="emoji">
        🙏
       </span>
       Prayer Meetings
      </div>
      <div className="moment">
       <span className="emoji">
        🧑
       </span>
       Youth Ministry
      </div>
      <div className="moment">
       <span className="emoji">
        🎨
       </span>
       Vacation Bible School
      </div>
      <div className="moment">
       <span className="emoji">
        🎄
       </span>
       Holiday Services
      </div>
      <div className="moment">
       <span className="emoji">
        🕊️
       </span>
       Funeral Announcements
      </div>
      <div className="moment">
       <span className="emoji">
        🌧️
       </span>
       Emergency Closures
      </div>
      <div className="moment">
       <span className="emoji">
        🤝
       </span>
       Community Outreach
      </div>
      <div className="moment">
       <span className="emoji">
        🙋
       </span>
       Volunteer Requests
      </div>
      <div className="moment">
       <span className="emoji">
        🎤
       </span>
       Guest Speakers
      </div>
      <div className="moment">
       <span className="emoji">
        🗓️
       </span>
       Special Events
      </div>
     </div>
    </div>
   </section>
   
   <section className="section" id="options">
    <div className="container partner-grid reveal">
     <article className="partner-intro">
      <h3>
       Church Partner Program
      </h3>
      <p>
       We believe every church—big or small—deserves easy communication. That is why we created a special low price just for churches.
      </p>
      <div className="mission">
       <b>
        ♡ Our Mission
       </b>
       <br/>
       Helping churches save time and reach more people with the important messages that matter most.
      </div>
     </article>
     <article className="option">
      <h3>
       🌐 Existing Website
      </h3>
      <p>
       We connect Text2MySite to your existing website.
      </p>
      <ul>
       <li>
        Unlimited announcements
       </li>
       <li>
        Instant updates by text
       </li>
       <li>
        Works on all your pages
       </li>
      </ul>
     </article>
     <article className="option">
      <h3>
       🖥️ No Website?
      </h3>
      <p>
       We host a beautiful announcement page for your church.
      </p>
      <ul>
       <li>
        Your own secure page
       </li>
       <li>
        Mobile-friendly design
       </li>
       <li>
        QR code for easy access
       </li>
      </ul>
     </article>
     <article className="price" id="pricing">
      <div className="price-label">
       Special Church Partner Price
      </div>
      <div className="price-main">
       $7.99
       <small>
        /month
       </small>
      </div>
      <p>
       Cancel anytime.
      </p>
      <ChurchTrialLink className="btn btn-primary">Start My Free 14-Day Trial</ChurchTrialLink>
      <p style={{fontSize: ".78rem", marginTop: "12px"}}>
       No long term contracts - guaranteed pricing
      </p>
      <p style={{fontSize: ".78rem", marginTop: "8px"}}>
       <a href="/church-pricing" style={{ textDecoration: "underline" }}>
        View full Church Partner pricing
       </a>
      </p>
     </article>
    </div>
   </section>
   
   <section className="section soft" id="faq">
    <div className="container">
     <div className="section-head reveal">
      <span className="eyebrow">
       Questions answered
      </span>
      <h2>
       Simple from the start.
      </h2>
     </div>
     <div className="faq reveal">
      <div className="faq-item">
       <button aria-expanded="false" className="faq-button">
        Do we need a church website?
        <span className="plus">
         +
        </span>
       </button>
       <div className="faq-answer">
        <div>
         <p>
          No. We can provide your church with a hosted announcement page. Churches with an existing website can also display the same announcements there.
         </p>
        </div>
       </div>
      </div>
      <div className="faq-item">
       <button aria-expanded="false" className="faq-button">
        Do we need a webmaster?
        <span className="plus">
         +
        </span>
       </button>
       <div className="faq-answer">
        <div>
         <p>
          No. Once setup is complete, sending a text message is all you need to do to publish a new announcement.
         </p>
        </div>
       </div>
      </div>
      <div className="faq-item">
       <button aria-expanded="false" className="faq-button">
        How quickly do announcements appear?
        <span className="plus">
         +
        </span>
       </button>
       <div className="faq-answer">
        <div>
         <p>
          Most announcements appear within seconds after your text message is received.
         </p>
        </div>
       </div>
      </div>
      <div className="faq-item">
       <button aria-expanded="false" className="faq-button">
        Can we cancel anytime?
        <span className="plus">
         +
        </span>
       </button>
       <div className="faq-answer">
        <div>
         <p>
          Yes. There are no long-term contracts, and your Church Partner rate remains available while your account stays active.
         </p>
        </div>
       </div>
      </div>
     </div>
    </div>
   </section>
   
   <section className="cta-band">
    <div className="container cta-inner">
     <div>
      <h3>
       Ready to keep your congregation informed?
      </h3>
      <p>
       Start your free 14-day trial today.
      </p>
     </div>
     <div>
      <ChurchTrialLink className="btn btn-primary">Start My Free 14-Day Trial</ChurchTrialLink>
      <p style={{textAlign: "center", fontSize: ".76rem", margin: "8px 0 0"}}>
       No long-term contract.
      </p>
     </div>
    </div>
   </section>
  </main>
  
  <footer className="footer">
   <div className="container footer-inner">
    <span>
     ©
     <span id="year">
     </span>
     Text2MySite™ for Churches. All rights reserved.
    </span>
    <div className="footer-links">
     <a href="/legal/privacy">
      Privacy Policy
     </a>
     <a href="/legal/terms">
      Terms of Service
     </a>
     <a href="mailto:support@t2ms.biz">
      Accessibility
     </a>
     <a href="mailto:support@t2ms.biz">
      Contact Us
     </a>
    </div>
   </div>
  </footer>
    </div>
  );
}
