import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import ChildrenList from "@/pages/children/list";
import ChildNew from "@/pages/children/new";
import ChildDetail from "@/pages/children/detail";
import ChildEdit from "@/pages/children/edit";
import ChildActivities from "@/pages/children/activities";
import ChildMemories from "@/pages/children/memories";
import MemoryNew from "@/pages/memories/new";
import MemoryDetail from "@/pages/memories/detail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/children" component={ChildrenList} />
      <Route path="/children/new" component={ChildNew} />
      <Route path="/children/:id" component={ChildDetail} />
      <Route path="/children/:id/edit" component={ChildEdit} />
      <Route path="/children/:id/activities" component={ChildActivities} />
      <Route path="/children/:id/memories" component={ChildMemories} />
      <Route path="/memories/new/:childId" component={MemoryNew} />
      <Route path="/memories/:id" component={MemoryDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
