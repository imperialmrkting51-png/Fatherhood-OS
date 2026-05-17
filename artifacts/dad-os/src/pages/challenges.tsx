import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Swords, Zap } from "lucide-react";
import { useGameState } from "@/hooks/use-game-state";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const CHALLENGES = [
  { id: "c1", title: "LEGO Fort Build-off", desc: "Build the tallest, sturdiest fort. Bonus points for structural integrity.", diff: "Medium" },
  { id: "c2", title: "Family Cook-off", desc: "Everyone makes one dish or snack. Present it like a master chef.", diff: "Hard" },
  { id: "c3", title: "Dance Battle", desc: "Pick 3 songs. Take turns freestyling in the living room.", diff: "Easy" },
  { id: "c4", title: "Scavenger Hunt", desc: "Hide 5 items around the house and draw a cryptic treasure map.", diff: "Medium" },
  { id: "c5", title: "Obstacle Course", desc: "Turn the hallway into lava. Use pillows, chairs, and blankets to cross.", diff: "Hard" },
  { id: "c6", title: "Talent Show", desc: "5 minutes to prepare. Perform a joke, song, magic trick, or weird skill.", diff: "Easy" },
];

export default function Challenges() {
  const { addXP } = useGameState();
  const [activeChallenges, setActiveChallenges] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);

  const accept = (id: string) => {
    if (!activeChallenges.includes(id)) {
      setActiveChallenges([...activeChallenges, id]);
    }
  };

  const complete = (id: string) => {
    if (!completed.includes(id)) {
      setCompleted([...completed, id]);
      setActiveChallenges(activeChallenges.filter(c => c !== id));
      addXP(20);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-secondary border border-accent rounded-none flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-2xl font-serif neon-text text-foreground">Boss Battles</h1>
          <p className="text-muted-foreground font-sans text-2xl font-medium">Major family challenges. Accept the challenge, complete the battle, earn massive XP.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHALLENGES.map((challenge) => {
            const isCompleted = completed.includes(challenge.id);
            const isActive = activeChallenges.includes(challenge.id);
            
            let difficultyColor = "bg-secondary text-secondary-foreground border-foreground";
            if (challenge.diff === "Medium") difficultyColor = "bg-primary text-primary-foreground border-primary";
            if (challenge.diff === "Hard") difficultyColor = "bg-destructive text-destructive-foreground border-destructive";

            return (
              <Card 
                key={challenge.id} 
                className={`pixel-border bg-card flex flex-col justify-between transition-all duration-300 ${isCompleted ? 'opacity-50 grayscale bg-secondary' : isActive ? 'border-accent shadow-md scale-[1.02]' : 'hover-elevate shadow-sm'}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`rounded-none font-sans text-lg uppercase ${difficultyColor}`}>{challenge.diff}</Badge>
                    <Badge variant="secondary" className="rounded-none font-sans text-lg bg-background border border-accent text-accent"><Zap className="w-3 h-3 mr-1 text-accent"/> 20 XP</Badge>
                  </div>
                  <CardTitle className="text-sm font-serif neon-text text-foreground">{challenge.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                  <p className="text-foreground font-sans text-xl leading-relaxed">{challenge.desc}</p>
                  
                  <div className="pt-4">
                    {isCompleted ? (
                      <Button variant="secondary" className="w-full font-sans text-xl rounded-none border border-primary" disabled>Completed</Button>
                    ) : isActive ? (
                      <Button onClick={() => complete(challenge.id)} className="w-full font-sans text-xl rounded-none neon-glow bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm border-none" data-testid={`btn-complete-${challenge.id}`}>
                        <Swords className="mr-2 h-5 w-5" /> Claim Victory!
                      </Button>
                    ) : (
                      <Button onClick={() => accept(challenge.id)} variant="outline" className="w-full font-sans text-xl rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground" data-testid={`btn-accept-${challenge.id}`}>
                        Accept Challenge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
