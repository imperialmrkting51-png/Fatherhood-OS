import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircleQuestion, Shuffle, Sparkles } from "lucide-react";
import { useGameState } from "@/hooks/use-game-state";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const STARTERS = {
  Imagination: [
    "If you could have any superpower for just one day, what would it be?",
    "If animals could talk, which one would be the funniest?",
    "If you could design a brand new planet, what would it look like?",
    "If you could shrink down to the size of a bug, where would you explore?",
    "If you had a time machine, where and when would you go first?",
    "What would you name a new color that nobody has ever seen before?"
  ],
  Dreams: [
    "What do you want to be when you grow up and why?",
    "If you could invent something to make life easier, what would it be?",
    "What is something you want to learn how to do this year?",
    "If you could travel anywhere in the universe, where would it be?",
    "What is your biggest dream right now?",
    "If you wrote a book, what would it be about?"
  ],
  Feelings: [
    "What made you feel proud of yourself today?",
    "What is something that always makes you laugh when you are sad?",
    "When was a time you felt really brave?",
    "What is the best compliment someone has ever given you?",
    "What makes you feel most loved?",
    "What do you do to calm down when you feel angry or upset?"
  ],
  Silly: [
    "Would you rather eat pizza every day or never eat pizza again?",
    "If you had to replace your hands with objects, what would they be?",
    "Would you rather fight one horse-sized duck or 100 duck-sized horses?",
    "What is the silliest word you can think of?",
    "If you could only eat one food for the rest of your life, what would it be?",
    "Would you rather have spaghetti for hair or sweat syrup?"
  ]
};

type Category = keyof typeof STARTERS;
const CATEGORIES = Object.keys(STARTERS) as Category[];

export default function Starters() {
  const { addXP } = useGameState();
  const [activePrompts, setActivePrompts] = useState<{category: Category, text: string, used: boolean}[]>(() => getNewPrompts());

  function getNewPrompts() {
    return CATEGORIES.map(cat => {
      const arr = STARTERS[cat];
      const randomItem = arr[Math.floor(Math.random() * arr.length)];
      return { category: cat, text: randomItem, used: false };
    });
  }

  const shuffle = () => {
    setActivePrompts(getNewPrompts());
  };

  const markUsed = (index: number) => {
    if (activePrompts[index].used) return;
    
    addXP(5);
    const newPrompts = [...activePrompts];
    newPrompts[index].used = true;
    setActivePrompts(newPrompts);
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
          <div>
            <h1 className="text-xl md:text-2xl font-serif neon-text text-foreground flex items-center justify-center md:justify-start gap-3">
              <MessageCircleQuestion className="w-8 h-8 text-primary" /> Conversation Starters
            </h1>
            <p className="text-muted-foreground mt-2 font-sans text-2xl font-medium">Earn +5 XP for every question asked.</p>
          </div>
          <Button onClick={shuffle} size="lg" className="rounded-none font-sans text-xl shadow-sm neon-glow" data-testid="btn-shuffle-starters">
            <Shuffle className="mr-2 h-5 w-5" /> Shuffle Deck
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activePrompts.map((prompt, i) => (
            <Card 
              key={i} 
              className={`pixel-border bg-card transition-all duration-300 ${prompt.used ? 'opacity-60 bg-secondary scale-[0.98]' : 'hover-elevate cursor-pointer shadow-md'}`}
              onClick={() => markUsed(i)}
              data-testid={`starter-card-${i}`}
            >
              <CardContent className="p-8 flex flex-col items-center text-center justify-center min-h-[220px] relative">
                <Badge variant="outline" className="absolute top-4 left-4 uppercase font-sans text-lg rounded-none border-primary text-primary">
                  {prompt.category}
                </Badge>
                {prompt.used && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground font-sans text-lg rounded-none">
                    +5 XP Earned
                  </Badge>
                )}
                <Sparkles className={`w-8 h-8 mb-4 ${prompt.used ? 'text-muted-foreground' : 'text-accent'}`} />
                <h3 className={`text-2xl font-sans leading-snug ${prompt.used ? 'text-muted-foreground' : 'text-foreground'}`}>
                  "{prompt.text}"
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
