import { useState } from "react";
import { useCreateChild, getListChildrenQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const PRESET_COLORS = [
  "#2C4C3B", // Forest
  "#C15C3D", // Amber/Rust
  "#3A5A6E", // Slate Blue
  "#7B6D5A", // Warm Taupe
  "#51414F", // Deep Purple/Brown
  "#8B7355", // Sand
];

export default function ChildNew() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createChild = useCreateChild();
  
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [notes, setNotes] = useState("");
  const [avatarColor, setAvatarColor] = useState(PRESET_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChild.mutate(
      { data: { name, birthdate, avatarColor, notes } },
      {
        onSuccess: (newChild) => {
          queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          setLocation(`/children/${newChild.id}`);
        }
      }
    );
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
        <header className="space-y-4">
          <Link href="/children" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Children
          </Link>
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">Add Child</h1>
            <p className="text-muted-foreground mt-2 text-lg">Create a profile to start tracking memories and milestones.</p>
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
                  placeholder="Child's name"
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
                  placeholder="Any special notes or traits..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={createChild.isPending}
                  className="rounded-full px-8"
                >
                  {createChild.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
