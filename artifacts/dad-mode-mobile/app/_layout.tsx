import {
  VT323_400Regular,
  useFonts as useVT323,
} from "@expo-google-fonts/vt323";
import {
  PressStart2P_400Regular,
  useFonts as usePS2P,
} from "@expo-google-fonts/press-start-2p";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

SplashScreen.preventAutoHideAsync();

const BG = "#0d1829";
const FONT_TIMEOUT_MS = 6000;

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

// Route Clerk API calls through the same proxy as the dad-os web app so that
// the Clerk dev-instance domain restriction doesn't block the mobile web build.
const clerkProxyUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/__clerk`
    : `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}/api/__clerk`;

const tokenCache =
  Platform.OS !== "web"
    ? {
        getToken: (key: string) => SecureStore.getItemAsync(key),
        saveToken: (key: string, value: string) =>
          SecureStore.setItemAsync(key, value),
        clearToken: (key: string) => SecureStore.deleteItemAsync(key),
      }
    : undefined;

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}`);

const queryClient = new QueryClient();

function AuthSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);
  return null;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="kid/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="privacy"
        options={{ headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [vt323Loaded, vt323Error] = useVT323({ VT323_400Regular });
  const [ps2pLoaded, ps2pError] = usePS2P({ PressStart2P_400Regular });
  // Explicitly preload Feather icon fonts so they render on native before any screen mounts
  const [iconsLoaded, iconsError] = useFonts(Feather.font);

  const [fontTimedOut, setFontTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFontTimedOut(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const ready =
    ((vt323Loaded || !!vt323Error) &&
    (ps2pLoaded || !!ps2pError) &&
    (iconsLoaded || !!iconsError)) ||
    fontTimedOut;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: BG }} />;
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} proxyUrl={clerkProxyUrl}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: BG }}>
              <AuthSync />
              <RootLayoutNav />
            </GestureHandlerRootView>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
