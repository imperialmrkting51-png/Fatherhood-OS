import { useGetChild, useGetChildGuidance, useListChildActivities, useListChildMemories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ChildAvatar } from "@/components/child-avatar";
import { formatAge, formatDate } from "@/lib/utils";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Compass, BookHeart, Swords, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function PartyDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: child, isLoading: loadingChild } = useGetChild(id, { query: { enabled: !!id } });
  const { data: guidance, isLoading: loadingGuidance } = useGetChildGuidance(id, { query: { enabled: !!id } });
  const { data: activities, isLoading: loadingActivities } = useListChildActivities(id, { query: { enabled: !!id } });
  const { data: memories, isLoading: loadingMemories } = useListChildMemories(id, { query: { enabled: !!id } });

  if (loadingChild) {
    return (
      <Layout>
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 md:col-span-2 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!child) return <Layout><div className="p-10 text-center font-bold">Party member not found</div></Layout>;

  const completedActivities = activities?.filter(a => a.completed) || [];
  const recentMemories = memories?.slice(0, 3) || [];
  const recentActivities = activities?.slice(0, 3) || [];

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <header className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/party" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Party
            </Link>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <ChildAvatar name={child.name} color={child.avatarColor} className="w-20 h-20 text-3xl shadow-md border-4 border-background" />
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">{child.name}</h1>
                <p className="text-primary mt-1 text-lg font-bold tracking-wide">Level {Math.floor(completedActivities.length / 5) + 1} Paladin</p>
              </div>
            </div>
            <div className="flex gap-2">
               <Link href={`/party/${id}/training`}>
                 <Button className="rounded-full font-bold shadow-sm" data-testid="btn-training"><Swords className="w-4 h-4 mr-2" /> Training</Button>
               </Link>
               <Link href={`/party/${id}/memories`}>
                 <Button variant="secondary" className="rounded-full font-bold shadow-sm" data-testid="btn-memories"><BookHeart className="w-4 h-4 mr-2" /> Quest Log</Button>
               </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-primary/5 border-primary/20 shadow-sm overflow-hidden border-2">
              <CardHeader className="bg-primary/10 pb-4 border-b border-primary/20">
                <CardTitle className="flex items-center gap-2 text-primary font-serif text-2xl">
                  <Lightbulb className="w-6 h-6" />
                  Trainer Guidance: {guidance?.stageName || "Growing Fast"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <p className="text-lg text-foreground font-medium leading-relaxed">{guidance?.description || "Every character develops at their own pace."}</p>
                
                {guidance?.tips && guidance.tips.length > 0 && (
                  <div className="space-y-3 bg-background rounded-lg p-4 border border-primary/10">
                    <h3 className="font-bold text-primary uppercase tracking-wider text-sm">Recommended Quests</h3>
                    <ul className="space-y-3">
                      {guidance.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground font-medium">
                          <Compass className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                  <BookHeart className="w-6 h-6 text-accent" />
                  Recent Quest Log
                </h2>
                <Link href={`/party/${id}/memories`}>
                  <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10">View All</Button>
                </Link>
              </div>
              
              {loadingMemories ? <Skeleton className="h-32 w-full" /> : recentMemories.length === 0 ? (
                <div className="bg-card border-2 border-dashed rounded-xl p-8 text-center">
                  <p className="text-muted-foreground font-medium">No memories logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMemories.map(memory => (
                    <Card key={memory.id} className="p-5 border-l-4 border-l-accent shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-muted-foreground">{formatDate(memory.date)}</span>
                            {memory.mood && (
                                <Badge variant="secondary" className="capitalize">{memory.mood}</Badge>
                            )}
                        </div>
                        <h3 className="text-xl font-serif font-bold text-foreground mb-2">{memory.title}</h3>
                        {memory.body && <p className="text-muted-foreground line-clamp-2">{memory.body}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <Card className="shadow-sm border-2">
              <CardHeader className="pb-3 border-b bg-secondary/30">
                <CardTitle className="text-lg font-serif font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2"><Swords className="w-5 h-5 text-primary" /> Recent Training</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingActivities ? (
                  <div className="p-4 space-y-3"><Skeleton className="h-10 w-full" /></div>
                ) : recentActivities.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground font-medium">
                    No recent training sessions.
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="p-4 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-foreground">{activity.title}</h4>
                            <Badge variant="outline" className="mt-1">{activity.category}</Badge>
                        </div>
                        {activity.completed ? <Badge className="bg-primary">Done</Badge> : <Badge variant="secondary">Pending</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {child.notes && (
              <Card className="shadow-sm bg-accent/5 border-accent/20 border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-accent uppercase tracking-wider">Character Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-foreground whitespace-pre-wrap">{child.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
