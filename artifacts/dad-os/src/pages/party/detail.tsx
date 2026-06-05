import { useGetChild, useGetChildGuidance, useListChildActivities, useListChildMemories, getGetChildQueryKey, getGetChildGuidanceQueryKey, getListChildActivitiesQueryKey, getListChildMemoriesQueryKey } from "@workspace/api-client-react";
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

  const { data: child, isLoading: loadingChild } = useGetChild(id, { query: { enabled: !!id, queryKey: getGetChildQueryKey(id) } });
  const { data: guidance, isLoading: loadingGuidance } = useGetChildGuidance(id, { query: { enabled: !!id, queryKey: getGetChildGuidanceQueryKey(id) } });
  const { data: activities, isLoading: loadingActivities } = useListChildActivities(id, { query: { enabled: !!id, queryKey: getListChildActivitiesQueryKey(id) } });
  const { data: memories, isLoading: loadingMemories } = useListChildMemories(id, { query: { enabled: !!id, queryKey: getListChildMemoriesQueryKey(id) } });

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
            <Link href="/party" className="inline-flex items-center text-xl font-sans text-muted-foreground hover:text-primary transition-colors" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Party
            </Link>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <ChildAvatar name={child.name} color={child.avatarColor} className="w-20 h-20 text-3xl rounded-none pixel-border bg-background" />
              <div>
                <h1 className="text-sm md:text-base font-serif neon-text text-foreground">{child.name}</h1>
                <p className="text-primary mt-1 text-2xl font-sans uppercase">Level {Math.floor(completedActivities.length / 5) + 1} Paladin</p>
              </div>
            </div>
            <div className="flex gap-2">
               <Link href={`/party/${id}/activities`}>
                 <Button className="rounded-none font-sans text-xl pixel-border bg-card text-primary hover:bg-primary hover:text-primary-foreground" data-testid="btn-training"><Swords className="w-4 h-4 mr-2" /> Activities</Button>
               </Link>
               <Link href={`/party/${id}/memories`}>
                 <Button variant="secondary" className="rounded-none font-sans text-xl pixel-border bg-card text-accent hover:bg-accent hover:text-accent-foreground" data-testid="btn-memories"><BookHeart className="w-4 h-4 mr-2" /> Memory Log</Button>
               </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card pixel-border overflow-hidden">
              <CardHeader className="bg-secondary pb-4 border-b border-primary">
                <CardTitle className="flex items-center gap-2 text-primary font-sans text-2xl uppercase">
                  <Lightbulb className="w-6 h-6" />
                  Player Guidance: {guidance?.stageName || "Growing Fast"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <p className="text-2xl font-sans text-foreground leading-relaxed">{guidance?.description || "Every character develops at their own pace."}</p>
                
                {guidance?.tips && guidance.tips.length > 0 && (
                  <div className="space-y-3 bg-secondary rounded-none p-4 pixel-border">
                    <h3 className="font-sans text-xl text-primary uppercase tracking-wider">Recommended Quests</h3>
                    <ul className="space-y-3">
                      {guidance.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-foreground font-sans text-xl">
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
                <h2 className="text-sm font-serif neon-text flex items-center gap-2">
                  <BookHeart className="w-6 h-6 text-accent" />
                  Memory Log
                </h2>
                <Link href={`/party/${id}/memories`}>
                  <Button variant="ghost" className="text-accent font-sans text-xl hover:text-accent-foreground hover:bg-accent rounded-none">View All</Button>
                </Link>
              </div>
              
              {loadingMemories ? <Skeleton className="h-32 w-full" /> : recentMemories.length === 0 ? (
                <div className="bg-card pixel-border rounded-none p-8 text-center">
                  <p className="text-muted-foreground font-sans text-xl">No memories logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMemories.map(memory => (
                    <Card key={memory.id} className="p-5 pixel-border bg-card border-l-4 border-l-accent shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xl font-sans text-primary uppercase">{formatDate(memory.date)}</span>
                            {memory.mood && (
                                <Badge variant="secondary" className="capitalize rounded-none font-sans text-lg bg-secondary border border-primary text-primary">{memory.mood}</Badge>
                            )}
                        </div>
                        <h3 className="text-xs font-serif neon-text text-foreground mb-2">{memory.title}</h3>
                        {memory.body && <p className="text-muted-foreground font-sans text-xl line-clamp-2">{memory.body}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <Card className="shadow-sm pixel-border bg-card">
              <CardHeader className="pb-3 border-b border-primary bg-secondary">
                <CardTitle className="text-xl font-sans uppercase flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary"><Swords className="w-5 h-5 text-primary" /> Recent Activities</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingActivities ? (
                  <div className="p-4 space-y-3"><Skeleton className="h-10 w-full" /></div>
                ) : recentActivities.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground font-sans text-xl">
                    No recent activities.
                  </div>
                ) : (
                  <div className="divide-y divide-primary">
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="p-4 flex items-center justify-between">
                        <div>
                            <h4 className="font-sans text-2xl text-foreground">{activity.title}</h4>
                            <Badge variant="outline" className="mt-1 rounded-none border-primary font-sans text-lg">{activity.category}</Badge>
                        </div>
                        {activity.completed ? <Badge className="bg-primary text-primary-foreground rounded-none font-sans text-lg">Done</Badge> : <Badge variant="secondary" className="rounded-none border border-primary text-primary font-sans text-lg">Pending</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {child.notes && (
              <Card className="shadow-sm bg-card pixel-border">
                <CardHeader className="pb-2 border-b border-accent bg-secondary">
                  <CardTitle className="text-xl font-sans text-accent uppercase tracking-wider">Character Notes</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-xl font-sans text-foreground whitespace-pre-wrap">{child.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
