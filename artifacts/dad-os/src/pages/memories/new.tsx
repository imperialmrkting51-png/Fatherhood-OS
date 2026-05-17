import { useState } from "react";
import { useCreateChildMemory, useGetChild, getListChildMemoriesQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link, useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const MOODS = ["happy", "excited", "proud", "peaceful", "adventurous", "funny", "challenging", "tender"];

export default function MemoryNew() {
  const params = useParams();
  const childId = Number(params.childId);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: child, isLoading } = useGetChild(childId, { query: { enabled: !!childId } });
  const createMemory = useCreateChildMemory();
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [body, setBody] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMemory.mutate(
      { data: { title, date, body, mood, imageUrl, childId } }, // Include childId if API needs it implicitly or explicitly, though route structure implies it's in body or inferred
      {
        onSuccess: (newMemory) => {
          queryClient.invalidateQueries({ queryKey: getListChildMemoriesQueryKey(childId) });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          setLocation(`/memories/${newMemory.id}`);
        }
      }
    );
  };

  if (isLoading) return <Layout><div className="p-10"><Skeleton className="h-[600px] max-w-2xl mx-auto rounded-xl" /></div></Layout>;
  if (!child) return <Layout><div className="p-10">Child not found</div></Layout>;

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
        <header className="space-y-4">
          <Link href={`/children/${childId}/memories`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Link>
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">New Memory</h1>
            <p className="text-muted-foreground mt-2 text-lg">Record a moment with {child.name}.</p>
          </div>
        </header>

        <Card className="shadow-sm border-t-4 border-t-accent">
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title" className="text-lg">Title</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    placeholder="e.g. First steps in the park"
                    className="text-xl py-6 font-serif"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                    className="py-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mood / Feeling</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOODS.map(m => (
                        <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body" className="text-lg">The Story</Label>
                <Textarea 
                  id="body" 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)} 
                  placeholder="What happened? How did it feel?"
                  className="min-h-[250px] resize-y text-lg leading-relaxed font-serif p-6 bg-secondary/20 border-none focus-visible:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Photo URL (Optional)
                </Label>
                <Input 
                  id="imageUrl" 
                  type="url"
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="https://..."
                  className="py-6"
                />
                {imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden h-48 bg-muted max-w-sm">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div className="pt-6 flex justify-end border-t">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={createMemory.isPending}
                  className="rounded-full px-10 h-14 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {createMemory.isPending ? "Saving..." : "Save to Journal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
