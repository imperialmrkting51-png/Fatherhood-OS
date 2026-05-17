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
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">Welcome back, Trainer.</h1>
            <p className="text-muted-foreground mt-2 text-lg">{today}</p>
          </div>
        </header>

        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" /> Daily Quests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-elevate cursor-pointer border shadow-sm transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                   <div className="font-semibold flex items-center gap-2">
                      <MessageCircleQuestion className="w-4 h-4 text-primary" /> Ask 3 Questions
                   </div>
                   <Link href="/starters" className="text-xs text-muted-foreground hover:underline">Go to Starters →</Link>
                </div>
                <Button 
                   variant={gameState.completedQuests.includes('quest-1') ? 'secondary' : 'outline'}
                   size="icon" 
                   className="rounded-full shrink-0 h-10 w-10"
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
                   <div className="font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" /> Micro-Activity
                   </div>
                   {dashboard?.childrenSummary?.[0] ? (
                     <Link href={`/party/${dashboard.childrenSummary[0].id}/training`} className="text-xs text-muted-foreground hover:underline">Start Training →</Link>
                   ) : (
                     <Link href="/party" className="text-xs text-muted-foreground hover:underline">Add party member →</Link>
                   )}
                </div>
                <Button 
                   variant={gameState.completedQuests.includes('quest-2') ? 'secondary' : 'outline'}
                   size="icon" 
                   className="rounded-full shrink-0 h-10 w-10"
                   onClick={() => handleQuestToggle('quest-2', !gameState.completedQuests.includes('quest-2'))}
                   data-testid="quest-toggle-2"
                >
                   {gameState.completedQuests.includes('quest-2') ? <CheckCircle2 className="w-6 h-6 text-accent" /> : <div className="w-5 h-5 border-2 rounded-full" />}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer border shadow-sm transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                   <div className="font-semibold flex items-center gap-2">
                      <BookHeart className="w-4 h-4 text-blue-500" /> Log a Memory
                   </div>
                   {dashboard?.childrenSummary?.[0] ? (
                     <Link href={`/party/${dashboard.childrenSummary[0].id}/memories`} className="text-xs text-muted-foreground hover:underline">Growth Check →</Link>
                   ) : (
                     <Link href="/party" className="text-xs text-muted-foreground hover:underline">Add party member →</Link>
                   )}
                </div>
                <Button 
                   variant={gameState.completedQuests.includes('quest-3') ? 'secondary' : 'outline'}
                   size="icon" 
                   className="rounded-full shrink-0 h-10 w-10"
                   onClick={() => handleQuestToggle('quest-3', !gameState.completedQuests.includes('quest-3'))}
                   data-testid="quest-toggle-3"
                >
                   {gameState.completedQuests.includes('quest-3') ? <CheckCircle2 className="w-6 h-6 text-blue-500" /> : <div className="w-5 h-5 border-2 rounded-full" />}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Party Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{dashboard?.totalChildren || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <BookHeart className="w-4 h-4" />
                Memories Logged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{dashboard?.totalMemories || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-secondary shadow-sm border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Training Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{dashboard?.completedActivities || 0} <span className="text-lg font-normal text-muted-foreground">/ {dashboard?.totalActivities || 0}</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-foreground">Recent Quest Log</h2>
            </div>
            
            {dashboard?.recentMemories.length === 0 ? (
              <div className="bg-card border-2 border-dashed rounded-xl p-10 text-center shadow-sm">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookHeart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No memories logged</h3>
                <p className="text-muted-foreground mb-6">Complete the "Log a Memory" quest to see it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard?.recentMemories.map((memory) => {
                  const child = dashboard.childrenSummary.find(c => c.id === memory.childId);
                  return (
                    <Link key={memory.id} href={`/party/${memory.childId}/memories`}>
                      <Card className="hover-elevate cursor-pointer border shadow-sm transition-all overflow-hidden group">
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{formatDate(memory.date)}</span>
                              {memory.mood && (
                                <span className="text-xs font-bold px-2 py-1 bg-secondary rounded-full text-secondary-foreground capitalize">{memory.mood}</span>
                              )}
                            </div>
                            <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{memory.title}</h3>
                            {memory.body && (
                              <p className="text-muted-foreground line-clamp-2 font-medium">{memory.body}</p>
                            )}
                          </div>
                          {child && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                              <ChildAvatar name={child.name} color={child.avatarColor} className="w-6 h-6 text-[10px]" />
                              <span className="text-sm font-bold">{child.name}</span>
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
            <h2 className="text-2xl font-serif font-bold text-foreground">Your Party</h2>
            <div className="flex flex-col gap-4">
              {dashboard?.childrenSummary.length === 0 ? (
                <div className="bg-card border-2 border-dashed rounded-xl p-6 text-center shadow-sm">
                  <p className="text-muted-foreground mb-4 font-medium">Your party is empty.</p>
                  <Link href="/party">
                    <Button variant="outline" className="w-full font-bold">Recruit Member</Button>
                  </Link>
                </div>
              ) : (
                dashboard?.childrenSummary.map((child) => (
                  <Link key={child.id} href={`/party/${child.id}`}>
                    <Card className="hover-elevate cursor-pointer border shadow-sm transition-all">
                      <CardContent className="p-5 flex items-center gap-4">
                        <ChildAvatar name={child.name} color={child.avatarColor} className="w-14 h-14 text-lg shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground truncate">{child.name}</h3>
                          <p className="text-sm font-bold text-primary">Level {Math.floor((child.memoriesCount || 0) / 5) + 1}</p>
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
