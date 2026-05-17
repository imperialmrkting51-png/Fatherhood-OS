import { useListChildActivities, useCreateChildActivity, useUpdateActivity, useDeleteActivity, getListChildActivitiesQueryKey, useGetChild } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2, Swords } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useGameState } from "@/hooks/use-game-state";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const activitySchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  category: z.enum(["outdoor", "creative", "educational", "bonding", "challenge"]),
  weekOf: z.string().optional(),
});

export default function PartyActivities() {
  const params = useParams();
  const id = Number(params.id);
  const { addXP } = useGameState();
  const queryClient = useQueryClient();

  const { data: child } = useGetChild(id, { query: { enabled: !!id } });
  const { data: activities, isLoading } = useListChildActivities(id, { query: { enabled: !!id } });
  const createActivity = useCreateChildActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      description: "",
      category: "bonding",
      weekOf: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (values: z.infer<typeof activitySchema>) => {
    createActivity.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListChildActivitiesQueryKey(id) });
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  const handleToggle = (actId: number, currentCompleted: boolean) => {
    updateActivity.mutate(
      { id: actId, data: { completed: !currentCompleted } },
      {
        onSuccess: () => {
          if (!currentCompleted) addXP(10);
          queryClient.invalidateQueries({ queryKey: getListChildActivitiesQueryKey(id) });
        }
      }
    );
  };

  const handleDelete = (actId: number) => {
    deleteActivity.mutate({ id: actId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListChildActivitiesQueryKey(id) })
    });
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        <header className="space-y-4">
          <Link href={`/party/${id}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {child?.name || 'Kid'}
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-foreground flex items-center gap-3 neon-text">
              <Swords className="w-8 h-8 text-primary" /> Activities
            </h1>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-none font-bold shadow-sm neon-glow" data-testid="btn-add-training">
                  <Plus className="mr-2 h-4 w-4" /> Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="pixel-border bg-card">
                <DialogHeader>
                  <DialogTitle className="font-serif text-sm neon-text">Plan Activity</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-xl">Title</FormLabel>
                          <FormControl><Input placeholder="e.g. Build a fort" className="pixel-border rounded-none bg-input text-xl" {...field} data-testid="input-training-title" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-xl">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="pixel-border rounded-none bg-input text-xl" data-testid="select-training-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="pixel-border rounded-none bg-popover">
                              <SelectItem className="font-sans text-xl" value="outdoor">Outdoor</SelectItem>
                              <SelectItem className="font-sans text-xl" value="creative">Creative</SelectItem>
                              <SelectItem className="font-sans text-xl" value="educational">Educational</SelectItem>
                              <SelectItem className="font-sans text-xl" value="bonding">Bonding</SelectItem>
                              <SelectItem className="font-sans text-xl" value="challenge">Challenge</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-xl">Description</FormLabel>
                          <FormControl><Textarea placeholder="Details about the activity..." className="pixel-border rounded-none bg-input text-xl" {...field} data-testid="input-training-desc" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full font-bold neon-glow rounded-none" disabled={createActivity.isPending} data-testid="btn-submit-training">
                      {createActivity.isPending ? "Planning..." : "Plan Activity"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {isLoading ? (
           <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
        ) : activities?.length === 0 ? (
           <div className="p-12 text-center pixel-border bg-card">
             <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
             <h3 className="text-xl font-bold font-serif neon-text text-sm">No Activities</h3>
             <p className="text-muted-foreground mt-2 font-sans text-xl">Plan an activity to earn XP.</p>
           </div>
        ) : (
           <div className="grid gap-4">
              {activities?.map(activity => (
                 <Card key={activity.id} className={`transition-all pixel-border rounded-none bg-card ${activity.completed ? 'opacity-70 bg-secondary' : 'hover-elevate shadow-sm'}`}>
                   <CardContent className="p-5 flex items-start gap-4">
                      <button onClick={() => handleToggle(activity.id, activity.completed || false)} className="mt-1 shrink-0" data-testid={`toggle-act-${activity.id}`}>
                         {activity.completed ? <CheckCircle2 className="w-8 h-8 text-primary" /> : <Circle className="w-8 h-8 text-muted-foreground hover:text-primary transition-colors" />}
                      </button>
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-serif text-sm ${activity.completed ? 'line-through text-muted-foreground' : 'text-foreground neon-text'}`}>{activity.title}</h3>
                            <Badge className="ml-2 uppercase tracking-wider text-xs rounded-none bg-primary text-primary-foreground">{activity.category}</Badge>
                         </div>
                         {activity.description && <p className="text-muted-foreground font-sans text-xl">{activity.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(activity.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none" data-testid={`btn-del-act-${activity.id}`}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                   </CardContent>
                 </Card>
              ))}
           </div>
        )}
      </div>
    </Layout>
  );
}
