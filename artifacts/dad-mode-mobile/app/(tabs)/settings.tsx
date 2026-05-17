import { useAuth, useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { FONTS } from "@/constants/fonts";

function SettingsRow({
  icon,
  label,
  onPress,
  destructive,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  value?: string;
}) {
  const colors = useColors();
  const iconColor = destructive ? colors.destructive : colors.primary;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: destructive ? colors.destructive + "44" : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + "22", borderColor: iconColor + "44" }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
        ) : null}
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

export default function Settings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Dad";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
      ]}
    >
      <Text style={[styles.title, { color: colors.primary }]}>SETTINGS</Text>

      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.profileAvatar, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "66" }]}>
          <Text style={[styles.profileInitials, { color: colors.primary }]}>
            {initials}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>
            {displayName}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
            {email}
          </Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" }]}>
          <Feather name="zap" size={14} color={colors.primary} />
          <Text style={[styles.levelText, { color: colors.primary }]}>LVL 1</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          APP
        </Text>
        <View style={styles.sectionRows}>
          <SettingsRow
            icon="users"
            label="Manage Kids"
            onPress={() => router.push("/(tabs)/kids")}
          />
          <SettingsRow
            icon="message-circle"
            label="Conversation Starters"
            onPress={() => router.push("/(tabs)/starters")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          INFO
        </Text>
        <View style={styles.sectionRows}>
          <SettingsRow icon="info" label="Version" value="1.0.0" />
          <SettingsRow
            icon="shield"
            label="Dad Mode"
            value="Track moments."
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionRows}>
          <SettingsRow
            icon="log-out"
            label="Sign Out"
            onPress={handleSignOut}
            destructive
          />
        </View>
      </View>

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Built for dads who show up.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.title,
    letterSpacing: 3,
    textShadowColor: "rgba(232,160,69,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 2,
    borderWidth: 2,
    padding: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  profileInitials: {
    fontSize: 22,
    fontFamily: FONTS.title,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontFamily: FONTS.pixel,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: FONTS.pixel,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 2,
    borderWidth: 2,
  },
  levelText: {
    fontSize: 13,
    fontFamily: FONTS.pixel,
    letterSpacing: 1,
  },
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: FONTS.pixel,
    letterSpacing: 2,
    paddingHorizontal: 4,
  },
  sectionRows: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 2,
    borderRadius: 2,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 17,
    fontFamily: FONTS.pixel,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: FONTS.pixel,
  },
  footer: {
    fontSize: 15,
    fontFamily: FONTS.pixel,
    textAlign: "center",
    marginTop: 8,
  },
});
