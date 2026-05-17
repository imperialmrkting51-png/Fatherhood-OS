import { useListChildren, useCreateChild, getListChildrenQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ChildAvatar } from "@/components/child-avatar";
import { formatAge } from "@/lib/utils";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const childSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthdate: z.string().min(1, "Birthdate is required"),
  avatarColor: z.string().default("#10b981"),
  notes: z.string().optional(),
});

export default function PartyList() {
  const { data: children, isLoading } = useListChildren();
  const createChild = useCreateChild();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof childSchema>>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      name: "",
      birthdate: new Date().toISOString().split('T')[0],
      avatarColor: "#10b981",
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof childSchema>) => {
    createChild.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
          setOpen(false);
          form.reset();
        },
      }
    );
  };

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
            <h1 className="text-xl md:text-2xl font-serif neon-text text-foreground">Your Kids</h1>
            <p className="text-muted-foreground mt-2 font-sans text-2xl">Manage your party members and their progress.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none font-sans text-xl neon-glow" data-testid="button-add-party-member">
                <Plus className="mr-2 h-4 w-4" />
                Add Kid
              </Button>
            </DialogTrigger>
            <DialogContent className="pixel-border bg-card">
              <DialogHeader>
                <DialogTitle className="font-serif text-sm neon-text">Add Kid</DialogTitle>
                <DialogDescription className="font-sans text-xl">Add a new kid to your fatherhood journey.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-xl">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Kid's name" className="pixel-border bg-input text-xl rounded-none" {...field} data-testid="input-child-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-xl">Birthdate</FormLabel>
                        <FormControl>
                          <Input type="date" className="pixel-border bg-input text-xl rounded-none" {...field} data-testid="input-child-birthdate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avatarColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-xl">Theme Color</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} className="h-10 w-20 pixel-border rounded-none" data-testid="input-child-color" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-xl">Special Traits (Notes)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any early signs of superpowers?" className="pixel-border bg-input text-xl rounded-none" {...field} data-testid="input-child-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full rounded-none font-sans text-xl neon-glow" disabled={createChild.isPending} data-testid="button-submit-child">
                    {createChild.isPending ? "Adding..." : "Confirm Kid"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </header>

        {children?.length === 0 ? (
          <div className="bg-card pixel-border rounded-none p-12 text-center max-w-2xl mx-auto mt-12">
            <div className="w-20 h-20 bg-secondary rounded-none flex items-center justify-center mx-auto mb-6 border border-primary">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-sm font-serif neon-text text-foreground mb-3">Your party is empty!</h3>
            <p className="text-muted-foreground font-sans text-xl mb-8 max-w-md mx-auto">
              Add your first kid to begin activities and logging memories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children?.map((child) => (
              <Link key={child.id} href={`/party/${child.id}`}>
                <Card className="hover-elevate cursor-pointer pixel-border bg-card transition-all group h-full">
                  <CardContent className="p-6 flex items-center justify-between h-full">
                    <div className="flex items-center gap-6">
                      <ChildAvatar name={child.name} color={child.avatarColor} className="w-16 h-16 text-xl rounded-none border-2 border-primary" />
                      <div>
                        <h2 className="text-xs font-serif neon-text text-foreground group-hover:text-primary transition-colors">{child.name}</h2>
                        {child.birthdate && (
                          <p className="text-primary font-sans text-xl mt-1">{formatAge(new Date().getFullYear() - new Date(child.birthdate).getFullYear(), 0)}</p>
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
