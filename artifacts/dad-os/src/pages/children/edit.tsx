import { useState, useEffect, useRef } from "react";
import { useGetChild, useUpdateChild, getGetChildQueryKey, getListChildrenQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link, useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const PRESET_COLORS = [
  "#2C4C3B", "#C15C3D", "#3A5A6E", "#7B6D5A", "#51414F", "#8B7355"
];

export default function ChildEdit() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: child, isLoading } = useGetChild(id, { query: { enabled: !!id } });
  const updateChild = useUpdateChild();
  
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [notes, setNotes] = useState("");
  const [avatarColor, setAvatarColor] = useState(PRESET_COLORS[0]);

  const initRef = useRef(false);

  useEffect(() => {
    if (child && !initRef.current) {
      initRef.current = true;
      setName(child.name);
      // Format birthdate for input type="date" (YYYY-MM-DD)
      setBirthdate(child.birthdate.split('T')[0]);
      setNotes(child.notes || "");
      setAvatarColor(child.avatarColor);
    }
  }, [child]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateChild.mutate(
      { id, data: { name, birthdate, avatarColor, notes } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetChildQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          setLocation(`/children/${id}`);
        }
      }
    );
  };

  if (isLoading) return <Layout><div className="p-10"><Skeleton className="h-[600px] w-full max-w-2xl mx-auto rounded-xl" /></div></Layout>;
  if (!child) return <Layout><div className="p-10">Not found</div></Layout>;

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
        <header className="space-y-4">
          <Link href={`/children/${id}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">Edit Profile</h1>
          </div>
        </header>

        <Card className="shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="text-lg py-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input 
                  id="birthdate" 
                  type="date" 
                  value={birthdate} 
                  onChange={(e) => setBirthdate(e.target.value)} 
                  required 
                  className="py-6"
                />
              </div>

              <div className="space-y-3">
                <Label>Avatar Color</Label>
                <div className="flex gap-3 flex-wrap">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={`w-12 h-12 rounded-full transition-all ${avatarColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={updateChild.isPending}
                  className="rounded-full px-8"
                >
                  {updateChild.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
