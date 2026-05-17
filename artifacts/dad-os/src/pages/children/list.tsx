import { useListChildren } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ChildAvatar } from "@/components/child-avatar";
import { formatAge } from "@/lib/utils";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, BookHeart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChildrenList() {
  const { data: children, isLoading } = useListChildren();

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">Children</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage profiles and track milestones.</p>
          </div>
          <Link href="/children/new">
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </Button>
          </Link>
        </header>

        {children?.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center shadow-sm max-w-2xl mx-auto mt-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookHeart className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-foreground mb-3">No profiles yet</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Add your child to start tracking activities, saving memories, and getting age-based guidance.
            </p>
            <Link href="/children/new">
              <Button size="lg" className="rounded-full">
                <Plus className="mr-2 h-5 w-5" />
                Add Your Child
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {children?.map((child) => (
              <Link key={child.id} href={`/children/${child.id}`}>
                <Card className="hover-elevate cursor-pointer border shadow-sm transition-all group">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <ChildAvatar name={child.name} color={child.avatarColor} className="w-16 h-16 text-xl shadow-sm" />
                      <div>
                        <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{child.name}</h2>
                        {child.birthdate && (
                          <p className="text-muted-foreground">Born {new Date(child.birthdate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
