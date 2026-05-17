import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Trash2, Key, Star } from "lucide-react";
import { useGameState, GameState } from "@/hooks/use-game-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { gameState, updateState } = useGameState();
  const { toast } = useToast();
  const [inviteCode] = useState("FATH-8X2M-9QZL");

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all XP and streaks? This cannot be undone.")) {
      updateState({ xp: 0, level: 1, streak: 0, completedQuests: [] });
      toast({ title: "Progress reset successfully." });
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({ title: "Invite key copied to clipboard!" });
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" /> Settings
          </h1>
        </header>

        <div className="space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-secondary/30 pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <Star className="w-5 h-5 text-accent" /> Profile & Faith Mode
              </CardTitle>
              <CardDescription className="text-base font-medium">Subtly adjusts guidance and starter questions.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-bold">Tradition / Faith Background</Label>
                <RadioGroup 
                  value={gameState.faithMode} 
                  onValueChange={(val) => updateState({ faithMode: val as GameState['faithMode'] })}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  data-testid="radio-faith-mode"
                >
                  {["none", "christian", "muslim", "jewish", "spiritual"].map((mode) => (
                    <div key={mode} className="flex items-center space-x-3 border-2 p-4 rounded-xl hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value={mode} id={`mode-${mode}`} />
                      <Label htmlFor={`mode-${mode}`} className="capitalize font-bold text-base cursor-pointer flex-1">
                        {mode === "none" ? "None / Secular" : mode}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-secondary/30 pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <Key className="w-5 h-5 text-primary" /> Co-Parent Access
              </CardTitle>
              <CardDescription className="text-base font-medium">Share this key to link accounts.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Label className="text-lg font-bold">Family Invite Key</Label>
              <div className="flex gap-4">
                <Input value={inviteCode} readOnly className="font-mono text-lg font-bold bg-muted" data-testid="input-invite-key" />
                <Button onClick={copyKey} variant="secondary" className="font-bold px-8">Copy</Button>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Currently, this key is for display purposes in the local demo.</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20 shadow-sm">
            <CardHeader className="bg-destructive/5 pb-4 border-b border-destructive/10">
              <CardTitle className="flex items-center gap-2 text-xl font-serif text-destructive">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 flex items-center justify-between">
              <div>
                 <h4 className="font-bold text-lg text-foreground">Reset Game Progress</h4>
                 <p className="text-muted-foreground font-medium">Resets level to 1 and clears all XP.</p>
              </div>
              <Button onClick={handleReset} variant="destructive" className="font-bold shadow-sm" data-testid="btn-reset-xp">
                Reset Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
