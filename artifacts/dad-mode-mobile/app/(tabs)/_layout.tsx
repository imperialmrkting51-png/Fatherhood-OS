import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "@/constants/theme";

function LoadingScreen() {
  return (
    <View style={s.loading}>
      <ActivityIndicator size="large" color={C.primary} />
    </View>
  );
}

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  const bottomPad = Math.max(insets.bottom, Platform.OS === "ios" ? 24 : 12);
  const tabBarHeight = 52 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.mutedFg,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopWidth: 2,
          borderTopColor: C.border,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: bottomPad,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: F.body,
          fontSize: 14,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="kids" options={{ title: "Party", tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} /> }} />
      <Tabs.Screen name="starters" options={{ title: "Starters", tabBarIcon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
});
