import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer2";
import { ContactForm } from "@/components/landing/contact-form";

export const metadata: Metadata = {
  title: "Contact Text2MySite™",
  description:
    "Have a question? Send the Text2MySite team a message about sales, support, billing, or partnerships.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-[min(760px,calc(100%-32px))] pt-28 pb-14">
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
