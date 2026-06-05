import { useAuth, useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetDashboard } from "@workspace/api-client-react";
import { C, F, GLOW } from "@/constants/theme";

function Row({
  icon, label, onPress, value, danger,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress?: () => void;
  value?: string;
  danger?: boolean;
}) {
  const col = danger ? C.red : C.primary;
  return (
    <Pressable
      style={({ pressed }) => [s.row, { borderColor: danger ? C.red + "44" : C.border, opacity: pressed ? 0.8 : 1 }]}
      onPress={onPress}
    >
      <View style={[s.rowIcon, { backgroundColor: col + "22", borderColor: col + "44" }]}>
        <Feather name={icon} size={18} color={col} />
      </View>
      <Text style={[s.rowLabel, { color: danger ? C.red : C.fg }]}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {value ? <Text style={[s.rowValue, { color: C.mutedFg }]}>{value}</Text> : null}
        <Feather name="chevron-right" size={16} color={C.mutedFg} />
      </View>
    </Pressable>
  );
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { data: dashboard } = useGetDashboard();

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Dad";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // Compute global dad level from total memories across all kids
  const dadLevel = Math.floor((dashboard?.totalMemories ?? 0) / 5) + 1;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Ready to end your session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive",
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
      style={{ backgroundColor: C.bg }}
      contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
    >
      {/* Title */}
      <Text style={[s.pageTitle, GLOW]}>SETTINGS</Text>

      {/* Profile card */}
      <View style={s.profileCard}>
        <View style={s.profileAvatar}>
          <Text style={[s.profileInitials, GLOW]}>{initials}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[s.profileName, { color: C.fg }]}>{displayName}</Text>
          <Text style={[s.profileEmail, { color: C.mutedFg }]}>{email}</Text>
        </View>
        <View style={s.levelBadge}>
          <Feather name="zap" size={14} color={C.primary} />
          <Text style={[s.levelText, { color: C.primary }]}>LVL {dadLevel}</Text>
        </View>
      </View>

      {/* Section: App */}
      <View style={s.section}>
        <Text style={[s.sectionLabel, { color: C.mutedFg }]}>APP</Text>
        <View style={s.rows}>
          <Row icon="users" label="Manage Party" onPress={() => router.push("/(tabs)/kids")} />
          <Row icon="message-circle" label="Conversation Starters" onPress={() => router.push("/(tabs)/starters")} />
        </View>
      </View>

      {/* Section: Info */}
      <View style={s.section}>
        <Text style={[s.sectionLabel, { color: C.mutedFg }]}>INFO</Text>
        <View style={s.rows}>
          <Row icon="info" label="Version" value="1.0.0" />
          <Row icon="shield" label="Privacy Policy" onPress={() => router.push("/privacy")} />
        </View>
      </View>

      {/* Sign out */}
      <View style={s.rows}>
        <Row icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
      </View>

      <Text style={[s.footer, { color: C.mutedFg }]}>Built for dads who show up.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 24 },
  pageTitle: { fontFamily: F.title, fontSize: 14, color: C.primary },

  profileCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: C.card, borderWidth: 2, borderColor: C.border,
    borderRadius: 2, padding: 16,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 2,
    borderWidth: 2, borderColor: C.primary + "77",
    backgroundColor: C.primary + "22",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  profileInitials: { fontFamily: F.title, fontSize: 18, color: C.primary },
  profileName: { fontFamily: F.body, fontSize: 20 },
  profileEmail: { fontFamily: F.body, fontSize: 15 },
  levelBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.primary + "22", borderWidth: 2, borderColor: C.primary + "55",
    borderRadius: 2, paddingHorizontal: 10, paddingVertical: 6,
  },
  levelText: { fontFamily: F.body, fontSize: 15, letterSpacing: 1 },

  section: { gap: 8 },
  sectionLabel: { fontFamily: F.body, fontSize: 13, letterSpacing: 2, paddingHorizontal: 2 },
  rows: { gap: 8 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    backgroundColor: C.card, borderWidth: 2, borderRadius: 2,
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 2, borderWidth: 2,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  rowLabel: { flex: 1, fontFamily: F.body, fontSize: 18 },
  rowValue: { fontFamily: F.body, fontSize: 15 },
  footer: { fontFamily: F.body, fontSize: 16, textAlign: "center", marginTop: 8 },
});
