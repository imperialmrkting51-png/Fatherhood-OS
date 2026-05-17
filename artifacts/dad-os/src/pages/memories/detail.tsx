import { useGetMemory, useGetChild, useDeleteMemory, getListChildMemoriesQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link, useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Calendar, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function MemoryDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: memory, isLoading: loadingMemory } = useGetMemory(id, { query: { enabled: !!id } });
  const childId = memory?.childId;
  const { data: child, isLoading: loadingChild } = useGetChild(childId as number, { query: { enabled: !!childId } });
  
  const deleteMemory = useDeleteMemory();

  const handleDelete = () => {
    if (confirm("Permanently delete this memory?")) {
      deleteMemory.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListChildMemoriesQueryKey(childId as number) });
            queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
            setLocation(`/children/${childId}/memories`);
          }
        }
      );
    }
  };

  if (loadingMemory || loadingChild) return <Layout><div className="p-10 max-w-3xl mx-auto"><Skeleton className="h-[500px] w-full" /></div></Layout>;
  if (!memory || !child) return <Layout><div className="p-10">Not found</div></Layout>;

  return (
    <Layout>
      <article className="min-h-full bg-card">
        {memory.imageUrl ? (
          <div className="w-full h-[40vh] md:h-[50vh] relative bg-muted">
            <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
            
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              <Link href={`/children/${child.id}/memories`}>
                <Button variant="secondary" size="sm" className="rounded-full bg-background/80 backdrop-blur-sm border-none shadow-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Journal
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="pt-10 px-6 max-w-3xl mx-auto">
            <Link href={`/children/${child.id}/memories`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journal
            </Link>
          </div>
        )}

        <div className={`px-6 max-w-3xl mx-auto ${memory.imageUrl ? '-mt-24 relative z-10' : ''}`}>
          <div className="bg-background rounded-3xl p-8 md:p-12 shadow-xl border border-border/50">
            <header className="mb-10 text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <span className="inline-flex items-center text-sm font-medium text-muted-foreground bg-secondary px-4 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(memory.date)}
                </span>
                {memory.mood && (
                  <span className="inline-flex items-center text-sm font-medium px-4 py-1.5 bg-accent/10 text-accent rounded-full capitalize">
                    {memory.mood}
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
                {memory.title}
              </h1>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <span>With</span>
                <Link href={`/children/${child.id}`} className="font-medium text-foreground hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">
                  {child.name}
                </Link>
              </div>
            </header>

            {memory.body && (
              <div className="prose prose-lg dark:prose-invert prose-p:font-serif prose-p:leading-loose prose-headings:font-serif max-w-none mx-auto text-foreground/90">
                {memory.body.split('\n').map((paragraph, i) => (
                  paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
                ))}
              </div>
            )}

            <footer className="mt-16 pt-8 border-t flex justify-end gap-3">
              <Button variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </footer>
          </div>
        </div>
        <div className="h-20"></div>
      </article>
    </Layout>
  );
}
