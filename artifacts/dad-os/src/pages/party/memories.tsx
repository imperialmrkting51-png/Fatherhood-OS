import { useListChildMemories, useCreateChildMemory, getListChildMemoriesQueryKey, useGetChild } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, BookHeart } from "lucide-react";
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
import { formatDate } from "@/lib/utils";

const memorySchema = z.object({
  title: z.string().min(1, "Title required"),
  body: z.string().optional(),
  date: z.string().min(1, "Date required"),
  mood: z.enum(["happy", "excited", "proud", "peaceful", "adventurous"]).optional(),
});

export default function PartyMemories() {
  const params = useParams();
  const id = Number(params.id);
  const { addXP } = useGameState();
  const queryClient = useQueryClient();

  const { data: child } = useGetChild(id, { query: { enabled: !!id } });
  const { data: memories, isLoading } = useListChildMemories(id, { query: { enabled: !!id } });
  const createMemory = useCreateChildMemory();

  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof memorySchema>>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: "",
      body: "",
      date: new Date().toISOString().split('T')[0],
      mood: "proud",
    },
  });

  const onSubmit = (values: z.infer<typeof memorySchema>) => {
    createMemory.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          addXP(20); // Logging memories gives high XP
          queryClient.invalidateQueries({ queryKey: getListChildMemoriesQueryKey(id) });
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        <header className="space-y-4">
          <Link href={`/party/${id}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {child?.name || 'Party Member'}
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground flex items-center gap-3">
              <BookHeart className="w-8 h-8 text-accent" /> Quest Log
            </h1>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full font-bold shadow-sm bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="btn-log-memory">
                  <Plus className="mr-2 h-4 w-4" /> Log Memory
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Quest Memory</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl><Input placeholder="e.g. First steps!" {...field} data-testid="input-memory-title" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl><Input type="date" {...field} data-testid="input-memory-date" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mood</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-memory-mood">
                                <SelectValue placeholder="Select mood" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="happy">Happy</SelectItem>
                              <SelectItem value="excited">Excited</SelectItem>
                              <SelectItem value="proud">Proud</SelectItem>
                              <SelectItem value="peaceful">Peaceful</SelectItem>
                              <SelectItem value="adventurous">Adventurous</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Story</FormLabel>
                          <FormControl><Textarea placeholder="What happened today?" className="min-h-[120px]" {...field} data-testid="input-memory-body" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full font-bold bg-accent hover:bg-accent/90 text-accent-foreground" disabled={createMemory.isPending} data-testid="btn-submit-memory">
                      {createMemory.isPending ? "Logging..." : "Commit to Log"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {isLoading ? (
           <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
        ) : memories?.length === 0 ? (
           <div className="p-12 text-center border-2 border-dashed rounded-xl">
             <BookHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
             <h3 className="text-xl font-bold">Quest Log is Empty</h3>
             <p className="text-muted-foreground mt-2">Log a memory to track your party's growth.</p>
           </div>
        ) : (
           <div className="relative border-l-4 border-accent/20 ml-4 space-y-8 pb-8">
              {memories?.map(memory => (
                 <div key={memory.id} className="relative pl-8">
                    <div className="absolute -left-[14px] top-4 w-6 h-6 rounded-full bg-accent border-4 border-background" />
                    <Card className="hover-elevate shadow-sm border-2">
                       <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-sm font-bold text-accent uppercase tracking-wider">{formatDate(memory.date)}</span>
                             {memory.mood && <Badge variant="secondary" className="capitalize px-3 py-1 font-bold">{memory.mood}</Badge>}
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-foreground mb-3">{memory.title}</h3>
                          {memory.body && <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">{memory.body}</p>}
                       </CardContent>
                    </Card>
                 </div>
              ))}
           </div>
        )}
      </div>
    </Layout>
  );
}
