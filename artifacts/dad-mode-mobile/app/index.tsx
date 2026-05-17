import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 32,
          paddingBottom: bottomPad + 24,
        },
      ]}
    >
      <View style={styles.hero}>
        <View
          style={[styles.iconWrapper, { backgroundColor: colors.secondary }]}
        >
          <Feather name="shield" size={40} color={colors.primary} />
          <View
            style={[styles.flameOverlay, { backgroundColor: "transparent" }]}
          >
            <Feather name="zap" size={22} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.primary }]}>DAD MODE</Text>
        <Text style={[styles.tagline, { color: colors.foreground }]}>
          Track moments. Level up.
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          Build deeper bonds with your kids through daily quests, memories, and
          age-based guidance.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.push("/sign-in")}
        >
          <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
            Sign In
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={() => router.push("/sign-up")}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
            Create Account
          </Text>
        </Pressable>
      </View>

      <View style={styles.features}>
        {[
          { icon: "users" as const, label: "Kid Profiles" },
          { icon: "book-open" as const, label: "Memory Journal" },
          { icon: "activity" as const, label: "XP & Streaks" },
        ].map((f) => (
          <View key={f.label} style={styles.feature}>
            <Feather name={f.icon} size={18} color={colors.accent} />
            <Text style={[styles.featureLabel, { color: colors.mutedForeground }]}>
              {f.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },
  flameOverlay: {
    position: "absolute",
    bottom: 18,
    right: 18,
  },
  title: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
    maxWidth: 300,
  },
  actions: {
    gap: 12,
    marginVertical: 32,
  },
  primaryBtn: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  secondaryBtn: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  features: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 8,
  },
  feature: {
    alignItems: "center",
    gap: 6,
  },
  featureLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
