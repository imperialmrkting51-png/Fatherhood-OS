import { useGetChild, useListChildMemories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookHeart, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function ChildMemories() {
  const params = useParams();
  const id = Number(params.id);

  const { data: child, isLoading: loadingChild } = useGetChild(id, { query: { enabled: !!id } });
  const { data: memories, isLoading: loadingMemories } = useListChildMemories(id, { query: { enabled: !!id } });

  if (loadingChild || loadingMemories) return <Layout><div className="p-10"><Skeleton className="h-64 w-full" /></div></Layout>;
  if (!child) return <Layout><div className="p-10">Not found</div></Layout>;

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        <header className="space-y-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
          <div>
            <Link href={`/children/${id}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {child.name}'s Profile
            </Link>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground flex items-center gap-3">
              <BookHeart className="w-8 h-8 text-accent" />
              Journal
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">A chronicle of moments with {child.name}.</p>
          </div>
          
          <Link href={`/memories/new/${id}`}>
            <Button className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Capture Memory
            </Button>
          </Link>
        </header>

        {memories?.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground max-w-md mx-auto">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <BookHeart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-foreground mb-3">The journal is empty</h3>
            <p className="text-lg mb-8">Memories fade quickly. Write them down while they're fresh.</p>
            <Link href={`/memories/new/${id}`}>
              <Button size="lg" className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Write First Entry
              </Button>
            </Link>
          </div>
        ) : (
          <div className="relative border-l-2 border-border/50 pl-6 ml-4 space-y-12 pb-12">
            {memories?.map(memory => (
              <div key={memory.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute w-4 h-4 bg-background border-2 border-accent rounded-full -left-[33px] top-6"></div>
                
                <Link href={`/memories/${memory.id}`}>
                  <Card className="hover-elevate cursor-pointer shadow-sm transition-all overflow-hidden group border hover:border-accent/50">
                    <div className="flex flex-col md:flex-row">
                      {memory.imageUrl && (
                        <div className="md:w-64 h-64 md:h-auto shrink-0 bg-muted overflow-hidden">
                          <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      )}
                      <div className="p-8 flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="text-sm font-semibold text-accent uppercase tracking-wider">{formatDate(memory.date)}</span>
                          {memory.mood && (
                            <span className="text-xs font-medium px-3 py-1 bg-secondary rounded-full text-secondary-foreground">{memory.mood}</span>
                          )}
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-foreground mb-4 group-hover:text-accent transition-colors">{memory.title}</h3>
                        {memory.body && (
                          <p className="text-muted-foreground text-lg leading-relaxed line-clamp-3">{memory.body}</p>
                        )}
                        <div className="mt-6 font-medium text-sm text-accent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Read full entry <ArrowLeft className="w-4 h-4 rotate-180" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
