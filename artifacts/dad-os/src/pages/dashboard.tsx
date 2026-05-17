import { useGetDashboard } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ChildAvatar } from "@/components/child-avatar";
import { formatAge, formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookHeart, Compass, Users, CheckSquare, MessageCircleQuestion, Activity, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameState } from "@/hooks/use-game-state";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const { gameState, addXP, updateState } = useGameState();

  const handleQuestToggle = (questId: string, completed: boolean) => {
    if (completed) {
      if (!gameState.completedQuests.includes(questId)) {
        addXP(15);
        updateState({ completedQuests: [...gameState.completedQuests, questId] });
      }
    } else {
      updateState({ completedQuests: gameState.completedQuests.filter(id => id !== questId) });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 md:p-10 space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-serif neon-text text-foreground">INSERT COIN TO CONTINUE.</h1>
            <p className="text-muted-foreground mt-2 font-sans text-2xl uppercase">{today}</p>
          </div>
        </header>

        <div className="space-y-4">
          <h2 className="text-sm font-serif flex items-center gap-2 neon-text">
            <CheckSquare className="w-6 h-6 text-primary" /> Daily Quests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-elevate cursor-pointer transition-all relative overflow-hidden group pixel-border bg-card">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                   <div className="font-sans text-2xl flex items-center gap-2">
                      <MessageCircleQuestion className="w-4 h-4 text-primary" /> Ask 3 Questions
                   </div>
                   <Link href="/starters" className="text-xl font-sans text-muted-foreground hover:text-primary">Go to Starters →</Link>
                </div>
                <Button 
                   variant={gameState.completedQuests.includes('quest-1') ? 'secondary' : 'outline'}
                   size="icon" 
                   className="rounded-none shrink-0 h-10 w-10 border-primary"
                   onClick={() => handleQuestToggle('quest-1', !gameState.completedQuests.includes('quest-1'))}
                   data-testid="quest-toggle-1"
                >
                   {gameState.completedQuests.includes('quest-1') ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <div className="w-5 h-5 border-2 rounded-full" />}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer border shadow-sm transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                   <div className="font-sans text-2xl flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" /> Micro-Activity
                   </div>
                   {dashboard?.childrenSummary?.[0] ? (
                     <Link href={`/party/${dashboard.childrenSummary[0].id}/activities`} className="text-xl font-sans text-muted-foreground hover:text-primary">Start Activity →</Link>
                   ) : (
                     <Link href="/party" className="text-xl font-sans text-muted-foreground hover:text-primary">Add a kid →</Link>
                   )}
                </div>
                <Button 
                   variant={gameState.completedQuests.includes('quest-2') ? 'secondary' : 'outline'}
                   size="icon" 
                   className="rounded-none shrink-0 h-10 w-10 border-accent"
                   onClick={() => handleQuestToggle('quest-2', !gameState.completedQuests.includes('quest-2'))}
                   data-testid="quest-toggle-2"
                >
                   {gameState.completedQuests.includes('quest-2') ? <CheckCircle2 className="w-6 h-6 text-accent" /> : <div className="w-5 h-5 border-2 border-accent rounded-none" />}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer transition-all relative overflow-hidden group pixel-border bg-card">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                   <div className="font-sans text-2xl flex items-center gap-2">
                      <BookHeart className="w-4 h-4 text-blue-500" /> Log a Memory
                   </div>
                   {dashboard?.childrenSummary?.[0] ? (
                     <Link href={`/party/${dashboard.childrenSummary[0].id}/memories`} className="text-xl font-sans text-muted-foreground hover:text-blue-500">Growth Check →</Link>
                   ) : (
                     <Link href="/party" className="text-xl font-sans text-muted-foreground hover:text-blue-500">Add a kid →</Link>
                   )}
                </div>
                <Button 
                   variant={gameState.completedQuests.includes('quest-3') ? 'secondary' : 'outline'}
                   size="icon" 
                   className="rounded-none shrink-0 h-10 w-10 border-blue-500"
                   onClick={() => handleQuestToggle('quest-3', !gameState.completedQuests.includes('quest-3'))}
                   data-testid="quest-toggle-3"
                >
                   {gameState.completedQuests.includes('quest-3') ? <CheckCircle2 className="w-6 h-6 text-blue-500" /> : <div className="w-5 h-5 border-2 border-blue-500 rounded-none" />}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card pixel-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-sans text-primary uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Kids
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-serif text-foreground neon-text">{dashboard?.totalChildren || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card pixel-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-sans text-accent uppercase tracking-wider flex items-center gap-2">
                <BookHeart className="w-4 h-4" />
                Memories Logged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-serif text-foreground neon-text">{dashboard?.totalMemories || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card pixel-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-sans text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Activities Done
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-serif text-foreground neon-text">{dashboard?.completedActivities || 0} <span className="text-lg font-sans text-muted-foreground">/ {dashboard?.totalActivities || 0}</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-serif neon-text text-foreground">Memory Log</h2>
            </div>
            
            {dashboard?.recentMemories.length === 0 ? (
              <div className="bg-card pixel-border rounded-none p-10 text-center">
                <div className="w-16 h-16 bg-secondary rounded-none flex items-center justify-center mx-auto mb-4 border border-primary">
                  <BookHeart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-serif text-foreground mb-2">No memories logged</h3>
                <p className="text-muted-foreground font-sans text-xl mb-6">Complete the "Log a Memory" quest to see it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard?.recentMemories.map((memory) => {
                  const child = dashboard.childrenSummary.find(c => c.id === memory.childId);
                  return (
                    <Link key={memory.id} href={`/party/${memory.childId}/memories`}>
                      <Card className="hover-elevate cursor-pointer pixel-border bg-card transition-all overflow-hidden group">
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xl font-sans text-primary uppercase tracking-wider">{formatDate(memory.date)}</span>
                              {memory.mood && (
                                <span className="text-lg font-sans px-2 py-1 bg-secondary border border-primary text-primary capitalize">{memory.mood}</span>
                              )}
                            </div>
                            <h3 className="text-sm font-serif text-foreground mb-2 group-hover:text-primary transition-colors">{memory.title}</h3>
                            {memory.body && (
                              <p className="text-muted-foreground font-sans text-xl line-clamp-2">{memory.body}</p>
                            )}
                          </div>
                          {child && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary/50">
                              <ChildAvatar name={child.name} color={child.avatarColor} className="w-6 h-6 text-[10px] rounded-none border border-primary" />
                              <span className="text-xl font-sans text-primary">{child.name}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-serif neon-text text-foreground">Your Kids</h2>
            <div className="flex flex-col gap-4">
              {dashboard?.childrenSummary.length === 0 ? (
                <div className="bg-card pixel-border rounded-none p-6 text-center">
                  <p className="text-muted-foreground mb-4 font-sans text-xl">Your party is empty.</p>
                  <Link href="/party">
                    <Button variant="outline" className="w-full font-sans text-xl rounded-none border-primary hover:bg-primary hover:text-primary-foreground">Add Kid</Button>
                  </Link>
                </div>
              ) : (
                dashboard?.childrenSummary.map((child) => (
                  <Link key={child.id} href={`/party/${child.id}`}>
                    <Card className="hover-elevate cursor-pointer pixel-border bg-card transition-all">
                      <CardContent className="p-5 flex items-center gap-4">
                        <ChildAvatar name={child.name} color={child.avatarColor} className="w-14 h-14 text-lg rounded-none border border-primary" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-xs text-foreground truncate mb-1">{child.name}</h3>
                          <p className="text-xl font-sans text-primary">Level {Math.floor((child.memoriesCount || 0) / 5) + 1}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
