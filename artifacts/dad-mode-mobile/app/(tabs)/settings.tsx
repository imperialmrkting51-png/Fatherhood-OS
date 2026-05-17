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
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: destructive
              ? colors.destructive + "22"
              : colors.secondary,
          },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={destructive ? colors.destructive : colors.accent}
        />
      </View>
      <Text
        style={[
          styles.rowLabel,
          { color: destructive ? colors.destructive : colors.foreground },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
            {value}
          </Text>
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

  const topPad = Platform.OS === "web" ? 67 : insets.top;
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
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      <Text style={[styles.title, { color: colors.primary }]}>Settings</Text>

      <View
        style={[
          styles.profileCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.profileAvatar,
            { backgroundColor: colors.primary + "33" },
          ]}
        >
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
            value="Track moments. Level up."
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitials: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    paddingHorizontal: 4,
  },
  sectionRows: {
    borderRadius: 12,
    overflow: "hidden",
    gap: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
