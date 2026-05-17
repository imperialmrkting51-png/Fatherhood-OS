import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Eye, HelpCircle, SplitSquareHorizontal, Edit3 } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useGameState } from "@/hooks/use-game-state";

export default function Games() {
  const { addXP } = useGameState();
  const [iSpyHint, setISpyHint] = useState<string>("Something red");
  const [story, setStory] = useState("");
  const [vote, setVote] = useState<number | null>(null);

  const iSpyHints = [
    "Something red", "Something round", "Something soft", "Something that makes noise",
    "Something you can read", "Something heavy", "Something smaller than an apple",
    "Something with numbers on it", "Something made of wood", "Something shiny"
  ];

  const rollISpy = () => {
    addXP(2);
    setISpyHint(iSpyHints[Math.floor(Math.random() * iSpyHints.length)]);
  };

  const commitStory = () => {
    if (story.trim()) {
      addXP(5);
      setStory("");
    }
  };

  const handleVote = (opt: number) => {
    setVote(opt);
    addXP(5);
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
        <header>
          <h1 className="text-xl md:text-2xl font-serif neon-text flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" /> Mini-Games
          </h1>
          <p className="text-muted-foreground mt-2 font-sans text-2xl font-medium">Quick games to play anytime, anywhere. No equipment needed.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* I Spy */}
          <Card className="pixel-border bg-card">
            <CardHeader className="bg-secondary pb-4 border-b border-primary">
              <CardTitle className="flex items-center gap-2 text-sm font-serif neon-text text-primary">
                <Eye className="w-6 h-6" /> I Spy
              </CardTitle>
              <CardDescription className="font-sans text-xl">Classic observation game with a twist.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-3xl font-sans font-bold italic text-foreground">
                "I spy with my little eye..."
              </div>
              <div className="inline-block px-6 py-3 bg-secondary rounded-none border border-primary text-2xl font-sans text-primary uppercase">
                {iSpyHint}
              </div>
              <div>
                <Button onClick={rollISpy} size="lg" className="rounded-none font-sans text-xl neon-glow" data-testid="btn-ispy-roll">
                  New Category (+2 XP)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 20 Questions */}
          <Card className="pixel-border bg-card">
            <CardHeader className="bg-secondary pb-4 border-b border-accent">
              <CardTitle className="flex items-center gap-2 text-sm font-serif neon-text" style={{color: "hsl(var(--accent))", textShadow: "0 0 8px hsl(var(--accent)), 0 0 20px hsl(var(--accent) / 0.4)"}}>
                <HelpCircle className="w-6 h-6" /> 20 Questions
              </CardTitle>
              <CardDescription className="font-sans text-xl">One thinks, the others deduce.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <ul className="space-y-4 font-sans text-xl text-foreground">
                <li className="flex items-start gap-3"><span className="font-bold text-accent">1.</span> Think of an animal, vegetable, or mineral.</li>
                <li className="flex items-start gap-3"><span className="font-bold text-accent">2.</span> The kids ask yes/no questions to narrow it down.</li>
                <li className="flex items-start gap-3"><span className="font-bold text-accent">3.</span> If they guess it in under 20 questions, they win!</li>
              </ul>
              <Button onClick={() => addXP(10)} variant="outline" className="w-full font-sans text-xl rounded-none border-accent text-accent hover:bg-accent hover:text-accent-foreground" data-testid="btn-20q-done">
                We Played (+10 XP)
              </Button>
            </CardContent>
          </Card>

          {/* Would You Rather */}
          <Card className="pixel-border bg-card">
            <CardHeader className="bg-secondary pb-4 border-b border-blue-500">
              <CardTitle className="flex items-center gap-2 text-sm font-serif text-blue-500" style={{textShadow: "0 0 8px theme(colors.blue.500), 0 0 20px theme(colors.blue.500 / 0.4)"}}>
                <SplitSquareHorizontal className="w-6 h-6" /> Would You Rather
              </CardTitle>
              <CardDescription className="font-sans text-xl">Vote and see the stats.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-2xl font-sans text-center mb-6">Have the ability to fly or be invisible?</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={vote === 1 ? "default" : "outline"} 
                  className={`h-24 font-sans text-xl whitespace-normal leading-tight rounded-none ${vote === 1 ? 'bg-blue-600' : 'border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white'}`}
                  onClick={() => handleVote(1)}
                  data-testid="btn-wyr-1"
                >
                  {vote !== null ? (vote === 1 ? "68% picked this" : "32% picked this") : "Ability to Fly"}
                </Button>
                <Button 
                  variant={vote === 2 ? "default" : "outline"} 
                  className={`h-24 font-sans text-xl whitespace-normal leading-tight rounded-none ${vote === 2 ? 'bg-blue-600' : 'border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white'}`}
                  onClick={() => handleVote(2)}
                  data-testid="btn-wyr-2"
                >
                  {vote !== null ? (vote === 2 ? "32% picked this" : "68% picked this") : "Be Invisible"}
                </Button>
              </div>
              {vote !== null && (
                <Button onClick={() => setVote(null)} variant="ghost" className="w-full mt-2 font-sans text-xl rounded-none">Next Question</Button>
              )}
            </CardContent>
          </Card>

          {/* Story Chain */}
          <Card className="pixel-border bg-card">
            <CardHeader className="bg-secondary pb-4 border-b border-primary">
              <CardTitle className="flex items-center gap-2 text-sm font-serif neon-text text-foreground">
                <Edit3 className="w-6 h-6" /> Story Chain
              </CardTitle>
              <CardDescription className="font-sans text-xl">Take turns adding one sentence.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Textarea 
                placeholder="Once upon a time in a land made entirely of cheese..." 
                className="min-h-[160px] font-sans text-xl leading-relaxed resize-none p-4 pixel-border bg-input rounded-none"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                data-testid="input-story"
              />
              <Button onClick={commitStory} className="w-full font-sans text-xl rounded-none neon-glow" disabled={!story.trim()} data-testid="btn-story-commit">
                Log Masterpiece (+5 XP)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
