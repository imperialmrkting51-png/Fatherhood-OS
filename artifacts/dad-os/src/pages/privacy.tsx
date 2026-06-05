import { Link } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "What We Collect",
    body: "Dad Mode collects only what you give us:\n\n• Your email address and name (via your sign-in account)\n• Your children's first names, birthdates, and optional notes\n• Activities you create for each child\n• Memory journal entries you write (title, body, date, optional mood, and optional photo)\n\nWe do not collect location data, device identifiers, contacts, or any data you did not explicitly enter.",
  },
  {
    title: "How We Use Your Data",
    body: "Your data is used exclusively to power the app:\n\n• Displaying your children's profiles and age-appropriate guidance\n• Storing and retrieving your activities and memories\n• Computing your dashboard stats and progress\n\nWe do not sell, share, or monetize your data. We do not use it for advertising, and we do not use third-party analytics or tracking.",
  },
  {
    title: "Data Storage & Security",
    body: "Your data is stored in a secure PostgreSQL database hosted on Replit infrastructure and is transmitted over encrypted HTTPS connections. Daily quest completion status is stored locally on your device only and is never sent to our servers.",
  },
  {
    title: "Authentication",
    body: "Sign-in is powered by Clerk (clerk.com). Clerk handles all credential storage and authentication flows. We receive only your name and email from Clerk — we never see or store your password.",
  },
  {
    title: "Children's Privacy",
    body: "Dad Mode is designed for use by parents to track their own parenting activities. We do not knowingly collect data from or about children directly. All data related to children is entered by the parent or guardian and is associated with the parent's account.",
  },
  {
    title: "Data Deletion",
    body: "You can delete any child profile (and all associated activities and memories) from within the app at any time. To delete your entire account and all associated data, email us at the address below and we will remove it.",
  },
  {
    title: "Contact",
    body: "Questions about this policy? Email us at: privacy@imperialmarketing.com",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="w-full border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-sans text-lg">Back</span>
        </Link>
        <span className="font-serif text-sm neon-text text-primary">Dad Mode</span>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-serif text-2xl text-primary neon-text mb-2">PRIVACY POLICY</h1>
        <p className="font-sans text-base text-muted-foreground mb-10">Last updated: June 2026</p>

        <div className="flex flex-col gap-8">
          {SECTIONS.map((sec) => (
            <section key={sec.title} className="flex flex-col gap-2">
              <h2 className="font-sans text-sm tracking-widest text-primary uppercase">{sec.title}</h2>
              <p className="font-sans text-lg text-foreground leading-relaxed whitespace-pre-line">{sec.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 flex items-start gap-3 border-2 border-border bg-card rounded-sm p-4">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            Dad Mode is built by parents, for parents. Your family's data stays yours.
          </p>
        </div>
      </main>
    </div>
  );
}
