import { Link } from "wouter";
import { Shield, BookHeart, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="w-full border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-serif text-sm neon-text text-primary">Dad Mode</span>
        <div className="flex gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="font-sans text-lg">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="font-sans text-lg bg-primary text-primary-foreground">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 flex items-center justify-center">
          <img src="/logo.svg" alt="Dad Mode" className="w-20 h-20" />
        </div>

        <h1 className="font-serif text-2xl md:text-3xl text-primary neon-text mb-4 leading-relaxed">
          DAD MODE
        </h1>
        <p className="font-sans text-2xl text-foreground max-w-xl mb-3">
          Your quest log for fatherhood.
        </p>
        <p className="font-sans text-xl text-muted-foreground max-w-lg mb-12">
          Track quality time with your kids, log memories, plan activities, and level up as a dad.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-12">
          {[
            { icon: Users, label: "Kid Profiles", desc: "Age-based guidance for each child" },
            { icon: BookHeart, label: "Memory Journal", desc: "Log the moments that matter" },
            { icon: Trophy, label: "XP & Streaks", desc: "Gamify your consistency" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="pixel-border bg-card p-5 flex flex-col items-center gap-2">
              <Icon className="w-6 h-6 text-primary" />
              <div className="font-serif text-xs text-primary">{label}</div>
              <div className="font-sans text-lg text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>

        <Link href="/sign-up">
          <Button size="lg" className="font-serif text-xs bg-primary text-primary-foreground neon-glow px-8 py-4">
            START YOUR QUEST
          </Button>
        </Link>
      </main>

      <footer className="w-full border-t border-border px-6 py-4 text-center">
        <span className="font-sans text-lg text-muted-foreground">
          Built for dads who show up.
        </span>
      </footer>
    </div>
  );
}
