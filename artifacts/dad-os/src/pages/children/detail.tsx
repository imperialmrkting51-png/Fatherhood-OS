import { useGetChild, useGetChildGuidance, useListChildActivities, useListChildMemories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ChildAvatar } from "@/components/child-avatar";
import { formatAge, formatDate } from "@/lib/utils";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Lightbulb, Compass, BookHeart, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChildDetail() {
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

  if (!child) return <Layout><div className="p-10">Child not found</div></Layout>;

  // Calculate age just for display if we don't have guidance yet
  const bdate = new Date(child.birthdate);
  const now = new Date();
  const mdiff = (now.getFullYear() - bdate.getFullYear()) * 12 + (now.getMonth() - bdate.getMonth());
  const years = Math.floor(mdiff / 12);
  const months = mdiff % 12;

  const displayYears = guidance?.ageYears ?? years;
  const displayMonths = guidance?.ageMonths ?? months;

  const completedActivities = activities?.filter(a => a.completed) || [];
  const pendingActivities = activities?.filter(a => !a.completed).slice(0, 3) || [];
  const recentMemories = memories?.slice(0, 3) || [];

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <header className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/children" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <Link href={`/children/${id}/edit`}>
              <Button variant="outline" size="sm" className="rounded-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <ChildAvatar name={child.name} color={child.avatarColor} className="w-24 h-24 text-3xl shadow-md" />
            <div>
              <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">{child.name}</h1>
              <p className="text-muted-foreground mt-2 text-xl font-medium">{formatAge(displayYears, displayMonths)} old</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Guidance Panel */}
            <Card className="bg-primary/5 border-primary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary font-serif text-2xl">
                  <Lightbulb className="w-6 h-6" />
                  Development Stage: {guidance?.stageName || "Growing"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <p className="text-lg text-foreground leading-relaxed">{guidance?.description || "Every child grows at their own pace."}</p>
                
                {guidance?.tips && guidance.tips.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Tips for this stage:</h3>
                    <ul className="space-y-2">
                      {guidance.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Memories Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                  <BookHeart className="w-6 h-6 text-accent" />
                  Recent Memories
                </h2>
                <Link href={`/children/${id}/memories`}>
                  <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10">View All</Button>
                </Link>
              </div>
              
              {loadingMemories ? <Skeleton className="h-32 w-full" /> : recentMemories.length === 0 ? (
                <div className="bg-card border rounded-xl p-8 text-center shadow-sm">
                  <p className="text-muted-foreground mb-4">No memories captured yet.</p>
                  <Link href={`/memories/new/${id}`}>
                    <Button variant="outline" className="rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Memory
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMemories.map(memory => (
                    <Link key={memory.id} href={`/memories/${memory.id}`}>
                      <Card className="hover-elevate cursor-pointer border shadow-sm transition-all overflow-hidden group">
                        <div className="flex flex-col sm:flex-row">
                          {memory.imageUrl && (
                            <div className="sm:w-32 h-32 sm:h-auto shrink-0 bg-muted overflow-hidden">
                              <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="p-5 flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{formatDate(memory.date)}</span>
                              {memory.mood && (
                                <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full text-secondary-foreground">{memory.mood}</span>
                              )}
                            </div>
                            <h3 className="text-lg font-serif font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{memory.title}</h3>
                            {memory.body && (
                              <p className="text-muted-foreground line-clamp-1 text-sm">{memory.body}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="flex flex-col gap-3">
              <Link href={`/memories/new/${id}`} className="w-full">
                <Button className="w-full justify-start text-lg h-14 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus className="mr-3 h-5 w-5" />
                  Capture Memory
                </Button>
              </Link>
              <Link href={`/children/${id}/activities`} className="w-full">
                <Button variant="outline" className="w-full justify-start text-lg h-14 rounded-xl border-primary text-primary hover:bg-primary/10">
                  <Compass className="mr-3 h-5 w-5" />
                  Plan Activity
                </Button>
              </Link>
            </div>

            {/* Activities Preview */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-serif font-bold flex items-center justify-between">
                  <span>Up Next</span>
                  <span className="text-sm font-sans font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {completedActivities.length} done
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingActivities ? (
                  <div className="p-4 space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                ) : pendingActivities.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No planned activities.<br/>Check guidance for ideas.
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingActivities.map(activity => (
                      <div key={activity.id} className="p-4 hover:bg-secondary/50 transition-colors">
                        <h4 className="font-medium text-foreground">{activity.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">{activity.category}</span>
                          {activity.weekOf && <span className="text-xs text-muted-foreground">• {activity.weekOf}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4 border-t bg-muted/20">
                  <Link href={`/children/${id}/activities`} className="text-sm font-medium text-primary hover:underline flex items-center justify-center">
                    Manage all activities
                  </Link>
                </div>
              </CardContent>
            </Card>

            {child.notes && (
              <Card className="shadow-sm bg-secondary/30 border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{child.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
