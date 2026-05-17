import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
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
import { useColors } from "@/hooks/useColors";
import { PixelLogo } from "@/components/PixelLogo";
import { FONTS } from "@/constants/fonts";

const FEATURES = [
  { label: "Kid Profiles", desc: "Age-based guidance for each child" },
  { label: "Memory Journal", desc: "Log the moments that matter" },
  { label: "XP & Streaks", desc: "Gamify your consistency" },
];

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

  const topPad = Platform.OS === "web" ? 24 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 24,
          paddingBottom: bottomPad + 16,
        },
      ]}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <PixelLogo size={88} />

        <Text style={[styles.title, { color: colors.primary }]}>
          DAD MODE
        </Text>
        <Text style={[styles.tagline, { color: colors.foreground }]}>
          Your quest log for fatherhood.
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          Track quality time with your kids, log memories, plan activities, and
          level up as a dad.
        </Text>
      </View>

      {/* Feature cards */}
      <View style={styles.cards}>
        {FEATURES.map((f) => (
          <View
            key={f.label}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.cardLabel, { color: colors.primary }]}>
              {f.label}
            </Text>
            <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
              {f.desc}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.questBtn,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
              shadowColor: colors.primary,
            },
          ]}
          onPress={() => router.push("/sign-up")}
        >
          <Text style={[styles.questBtnText, { color: colors.primaryForeground }]}>
            START YOUR QUEST
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/sign-in")}>
          <Text style={[styles.signInLink, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary }}>Sign In</Text>
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Built for dads who show up.
      </Text>
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
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.title,
    letterSpacing: 4,
    marginTop: 8,
    textShadowColor: "rgba(232,160,69,0.7)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: 22,
    fontFamily: FONTS.pixel,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    fontFamily: FONTS.pixel,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 320,
  },
  cards: {
    gap: 8,
    marginVertical: 16,
  },
  card: {
    borderWidth: 2,
    borderRadius: 2,
    padding: 12,
    gap: 4,
    shadowColor: "#e8a045",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: FONTS.pixel,
  },
  cardDesc: {
    fontSize: 17,
    fontFamily: FONTS.pixel,
  },
  actions: {
    gap: 14,
    alignItems: "center",
  },
  questBtn: {
    width: "100%",
    borderRadius: 2,
    paddingVertical: 16,
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
  questBtnText: {
    fontSize: 14,
    fontFamily: FONTS.title,
    letterSpacing: 2,
  },
  signInLink: {
    fontSize: 17,
    fontFamily: FONTS.pixel,
    textAlign: "center",
  },
  footer: {
    fontSize: 17,
    fontFamily: FONTS.pixel,
    textAlign: "center",
    paddingBottom: 4,
  },
});
