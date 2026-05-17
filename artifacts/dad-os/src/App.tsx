import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import PartyList from "@/pages/party/list";
import PartyDetail from "@/pages/party/detail";
import PartyTraining from "@/pages/party/training";
import PartyMemories from "@/pages/party/memories";
import Starters from "@/pages/starters";
import Games from "@/pages/games";
import Challenges from "@/pages/challenges";
import Settings from "@/pages/settings";

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
      <Route path="/party" component={PartyList} />
      <Route path="/party/:id" component={PartyDetail} />
      <Route path="/party/:id/training" component={PartyTraining} />
      <Route path="/party/:id/memories" component={PartyMemories} />
      <Route path="/starters" component={Starters} />
      <Route path="/games" component={Games} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/settings" component={Settings} />
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
