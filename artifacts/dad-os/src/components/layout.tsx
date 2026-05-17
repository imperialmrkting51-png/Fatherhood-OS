import { Link, useLocation } from "wouter";
import { BookHeart, Compass, Home, Plus, Users, Menu, Gamepad2, Trophy, Settings, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { Progress } from "@/components/ui/progress";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { gameState } = useGameState();

  const navItems = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "Party", href: "/party", icon: Users },
    { label: "Starters", href: "/starters", icon: MessageCircleQuestion },
    { label: "Games", href: "/games", icon: Gamepad2 },
    { label: "Challenges", href: "/challenges", icon: Trophy },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const NavLinks = () => (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => {
        const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className="w-full" onClick={() => setMobileMenuOpen(false)}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-6 bg-card border-r-0 pixel-border">
                <div className="flex items-center gap-2 mb-8">
                  <span className="font-serif text-sm neon-text text-primary">Fatherhood OS</span>
                </div>
                <NavLinks />
              </SheetContent>
            </Sheet>
            <Link href="/">
               <div className="flex items-center gap-2 cursor-pointer">
                 <span className="font-serif text-sm neon-text hidden md:inline-block text-primary">Fatherhood OS</span>
               </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 mx-6 flex-1">
             {navItems.map((item) => {
                const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant={active ? "secondary" : "ghost"} size="sm" className="gap-2" data-testid={`nav-desktop-${item.label.toLowerCase()}`}>
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
             })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-none border border-primary neon-border">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-sm font-sans text-xl">{gameState.streak}-day streak</span>
            </div>
            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-none font-serif text-xs">
              Lvl {gameState.level}
            </div>
          </div>
        </div>
        <div className="w-full bg-secondary border-t border-primary neon-border py-2 px-4 md:px-8">
          <div className="container flex items-center gap-4">
            <span className="font-sans text-xl text-muted-foreground w-24 text-right shrink-0">Level {gameState.level}</span>
            <Progress value={gameState.xp} className="h-4 flex-1 rounded-none bg-background border border-primary overflow-hidden [&>div]:bg-primary" data-testid="xp-bar" />
            <span className="font-sans text-xl text-muted-foreground w-24 shrink-0">{gameState.xp} / 100 XP</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
