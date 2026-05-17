import { useState } from "react";
import { useGetChild, useListChildActivities, useCreateChildActivity, useUpdateActivity, useDeleteActivity, useGetChildGuidance, getListChildActivitiesQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Compass, CheckCircle2, Circle, Plus, Trash2, Lightbulb } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CATEGORIES = ["outdoor", "creative", "educational", "bonding", "routine", "other"];

export default function ChildActivities() {
  const params = useParams();
  const id = Number(params.id);
  const queryClient = useQueryClient();

  const { data: child, isLoading: loadingChild } = useGetChild(id, { query: { enabled: !!id } });
  const { data: activities, isLoading: loadingActivities } = useListChildActivities(id, { query: { enabled: !!id } });
  const { data: guidance } = useGetChildGuidance(id, { query: { enabled: !!id } });
  
  const createActivity = useCreateChildActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity.mutate(
      { id, data: { title, category, description } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListChildActivitiesQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          setIsAddOpen(false);
          setTitle("");
          setDescription("");
          setCategory(CATEGORIES[0]);
        }
      }
    );
  };

  const toggleComplete = (activityId: number, completed: boolean) => {
    updateActivity.mutate(
      { id: activityId, data: { completed: !completed } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListChildActivitiesQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        }
      }
    );
  };

  const handleDelete = (activityId: number) => {
    if (confirm("Delete this activity?")) {
      deleteActivity.mutate(
        { id: activityId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListChildActivitiesQueryKey(id) });
            queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          }
        }
      );
    }
  };

  const adoptSuggestion = (suggestionTitle: string) => {
    setTitle(suggestionTitle);
    setCategory("bonding");
    setIsAddOpen(true);
  };

  if (loadingChild || loadingActivities) return <Layout><div className="p-10"><Skeleton className="h-64 w-full" /></div></Layout>;
  if (!child) return <Layout><div className="p-10">Not found</div></Layout>;

  const pending = activities?.filter(a => !a.completed) || [];
  const completed = activities?.filter(a => a.completed) || [];

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        <header className="space-y-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link href={`/children/${id}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {child.name}'s Profile
            </Link>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground flex items-center gap-3">
              <Compass className="w-8 h-8 text-primary" />
              Activities
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Ideas and tracking for quality time.</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Build a fort" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details..." />
                </div>
                <Button type="submit" className="w-full" disabled={createActivity.isPending}>
                  {createActivity.isPending ? "Adding..." : "Add"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {guidance?.suggestedActivities && guidance.suggestedActivities.length > 0 && (
          <Card className="bg-secondary border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                Suggested for {child.name}'s age
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {guidance.suggestedActivities.map((sug, i) => (
                  <button 
                    key={i} 
                    onClick={() => adoptSuggestion(sug)}
                    className="text-sm bg-card border px-3 py-1.5 rounded-full hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {sug}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-foreground">Up Next</h2>
            {pending.length === 0 ? (
              <div className="p-8 text-center bg-card border rounded-xl shadow-sm text-muted-foreground">
                No pending activities. Add something fun!
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(act => (
                  <Card key={act.id} className="shadow-sm border border-primary/20 bg-primary/5">
                    <CardContent className="p-4 flex gap-4">
                      <button onClick={() => toggleComplete(act.id, act.completed)} className="mt-1 shrink-0 text-muted-foreground hover:text-primary transition-colors">
                        <Circle className="w-6 h-6" />
                      </button>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground text-lg">{act.title}</h4>
                        {act.description && <p className="text-muted-foreground text-sm mt-1">{act.description}</p>}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs font-medium uppercase tracking-wider px-2 py-1 bg-background rounded-md text-muted-foreground">{act.category}</span>
                          <button onClick={() => handleDelete(act.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-foreground">Completed</h2>
            {completed.length === 0 ? (
              <div className="p-8 text-center bg-card border rounded-xl shadow-sm text-muted-foreground">
                Check off activities to see them here.
              </div>
            ) : (
              <div className="space-y-3 opacity-70">
                {completed.map(act => (
                  <Card key={act.id} className="shadow-sm">
                    <CardContent className="p-4 flex gap-4">
                      <button onClick={() => toggleComplete(act.id, act.completed)} className="mt-1 shrink-0 text-primary transition-colors">
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground line-through">{act.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{act.category}</span>
                          <button onClick={() => handleDelete(act.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
