import { useEffect, useRef } from "react";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Privacy from "@/pages/privacy";

import Dashboard from "@/pages/dashboard";
import PartyList from "@/pages/party/list";
import PartyDetail from "@/pages/party/detail";
import PartyActivities from "@/pages/party/activities";
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

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#e8a045",
    colorForeground: "#d4e4f0",
    colorMutedForeground: "#7a9ab5",
    colorDanger: "#c0392b",
    colorBackground: "#0d1829",
    colorInput: "#162035",
    colorInputForeground: "#d4e4f0",
    colorNeutral: "#2e4a6a",
    fontFamily: "'VT323', monospace",
    borderRadius: "0.25rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0d1829] border border-[#2e4a6a] rounded-sm w-[440px] max-w-full overflow-hidden shadow-[0_0_24px_rgba(232,160,69,0.15)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#e8a045]",
    headerSubtitle: "text-[#7a9ab5]",
    socialButtonsBlockButtonText: "text-[#d4e4f0]",
    formFieldLabel: "text-[#d4e4f0]",
    footerActionLink: "text-[#e8a045]",
    footerActionText: "text-[#7a9ab5]",
    dividerText: "text-[#7a9ab5]",
    identityPreviewEditButton: "text-[#e8a045]",
    formFieldSuccessText: "text-[#6baed6]",
    alertText: "text-[#d4e4f0]",
    logoBox: "flex justify-center mb-2",
    logoImage: "w-12 h-12",
    socialButtonsBlockButton: "border border-[#2e4a6a] bg-[#162035]",
    formButtonPrimary: "bg-[#e8a045] text-[#0d1829]",
    formFieldInput: "bg-[#162035] border-[#2e4a6a] text-[#d4e4f0]",
    footerAction: "bg-[#0d1829]",
    dividerLine: "bg-[#2e4a6a]",
    alert: "bg-[#162035] border-[#2e4a6a]",
    otpCodeFieldInput: "bg-[#162035] border-[#2e4a6a] text-[#d4e4f0]",
    formFieldRow: "gap-2",
    main: "gap-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function AppRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back, Dad",
            subtitle: "Sign in to your quest log",
          },
        },
        signUp: {
          start: {
            title: "Begin Your Quest",
            subtitle: "Create your Dad Mode account",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/party" component={() => <ProtectedRoute component={PartyList} />} />
            <Route path="/party/:id" component={() => <ProtectedRoute component={PartyDetail} />} />
            <Route path="/party/:id/activities" component={() => <ProtectedRoute component={PartyActivities} />} />
            <Route path="/party/:id/memories" component={() => <ProtectedRoute component={PartyMemories} />} />
            <Route path="/starters" component={() => <ProtectedRoute component={Starters} />} />
            <Route path="/games" component={() => <ProtectedRoute component={Games} />} />
            <Route path="/challenges" component={() => <ProtectedRoute component={Challenges} />} />
            <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AppRoutes />
    </WouterRouter>
  );
}

export default App;
