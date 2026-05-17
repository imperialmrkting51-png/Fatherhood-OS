import { useGetDashboard } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ChildAvatar } from "@/components/child-avatar";
import { formatAge, formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookHeart, Plus, Compass, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

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

  if (!dashboard || dashboard.totalChildren === 0) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <BookHeart className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-3">Welcome to Dad OS</h2>
          <p className="text-muted-foreground text-lg max-w-md mb-8">
            A quiet, intentional space to track quality time, milestones, and memories with your children.
          </p>
          <Link href="/children/new">
            <Button size="lg" className="rounded-full text-md px-8 h-12">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Child
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">Your command center for fatherhood.</p>
          </div>
          <Link href="/children/new">
            <Button variant="outline" className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Children
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{dashboard.totalChildren}</div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <BookHeart className="w-4 h-4" />
                Memories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{dashboard.totalMemories}</div>
            </CardContent>
          </Card>
          <Card className="bg-secondary shadow-sm border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Activities Done
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{dashboard.completedActivities} <span className="text-lg font-normal text-muted-foreground">/ {dashboard.totalActivities}</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-foreground">Recent Memories</h2>
            </div>
            
            {dashboard.recentMemories.length === 0 ? (
              <div className="bg-card border rounded-xl p-10 text-center shadow-sm">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookHeart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No memories yet</h3>
                <p className="text-muted-foreground mb-6">Start building your journal by adding a memory.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.recentMemories.map((memory) => {
                  const child = dashboard.childrenSummary.find(c => c.id === memory.childId);
                  return (
                    <Link key={memory.id} href={`/memories/${memory.id}`}>
                      <Card className="hover-elevate cursor-pointer border shadow-sm transition-all overflow-hidden group">
                        <div className="flex flex-col sm:flex-row">
                          {memory.imageUrl && (
                            <div className="sm:w-48 h-48 sm:h-auto shrink-0 bg-muted overflow-hidden">
                              <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{formatDate(memory.date)}</span>
                                {memory.mood && (
                                  <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full text-secondary-foreground">{memory.mood}</span>
                                )}
                              </div>
                              <h3 className="text-xl font-serif font-bold text-foreground mb-2">{memory.title}</h3>
                              {memory.body && (
                                <p className="text-muted-foreground line-clamp-2">{memory.body}</p>
                              )}
                            </div>
                            {child && (
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                                <ChildAvatar name={child.name} color={child.avatarColor} className="w-6 h-6 text-[10px]" />
                                <span className="text-sm font-medium">{child.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Your Children</h2>
            <div className="flex flex-col gap-4">
              {dashboard.childrenSummary.map((child) => (
                <Link key={child.id} href={`/children/${child.id}`}>
                  <Card className="hover-elevate cursor-pointer border shadow-sm transition-all">
                    <CardContent className="p-5 flex items-center gap-4">
                      <ChildAvatar name={child.name} color={child.avatarColor} className="w-14 h-14 text-lg shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-foreground truncate">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">{formatAge(child.ageYears, child.ageMonths)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
