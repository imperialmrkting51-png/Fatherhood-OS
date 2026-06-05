import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, GLOW } from "@/constants/theme";

const SECTIONS = [
  {
    title: "What We Collect",
    body: "Dad Mode collects only what you give us:\n\n• Your email address and name (via your sign-in account)\n• Your children's first names, birthdates, and optional notes\n• Activities you create for each child\n• Memory journal entries you write (title, body, date, mood)\n\nWe do not collect location data, device identifiers, contacts, or any data you did not explicitly enter.",
  },
  {
    title: "How We Use Your Data",
    body: "Your data is used exclusively to power the app:\n\n• Displaying your children's profiles and age-appropriate guidance\n• Storing and retrieving your activities and memories\n• Computing your dashboard stats\n\nWe do not sell, share, or monetize your data. We do not use it for advertising or analytics beyond what is required to operate the service.",
  },
  {
    title: "Data Storage",
    body: "Your data is stored in a secure PostgreSQL database hosted on Replit infrastructure. Daily quest completion status is stored locally on your device only and is never sent to our servers.",
  },
  {
    title: "Authentication",
    body: "Sign-in is powered by Clerk (clerk.com). Clerk handles all credential storage and authentication flows. We receive only your name and email from Clerk — we never see your password.",
  },
  {
    title: "Children's Privacy",
    body: "Dad Mode is designed for use by parents to track their own parenting activities. We do not knowingly collect data from or about children directly. All data related to children is entered by the parent/guardian and is associated with the parent's account.",
  },
  {
    title: "Data Deletion",
    body: "You can delete any child profile (and all associated activities and memories) from within the app. To delete your entire account and all associated data, contact us at the email below.",
  },
  {
    title: "Contact",
    body: "Questions about this policy? Email us at: privacy@imperialmarketing.com",
  },
];

export default function Privacy() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 24 : insets.top;

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <View style={[s.header, { paddingTop: topPad + 8, borderBottomColor: C.border }]}>
        <Pressable style={s.back} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.fg} />
        </Pressable>
        <Text style={[s.title, GLOW]}>PRIVACY POLICY</Text>
        <View style={s.back} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={[s.updated, { color: C.mutedFg }]}>Last updated: June 2025</Text>

        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text style={[s.secTitle, { color: C.primary }]}>{sec.title.toUpperCase()}</Text>
            <Text style={[s.secBody, { color: C.fg }]}>{sec.body}</Text>
          </View>
        ))}

        <View style={[s.badge, { borderColor: C.border, backgroundColor: C.card }]}>
          <Feather name="shield" size={18} color={C.primary} />
          <Text style={[s.badgeText, { color: C.mutedFg }]}>
            Dad Mode is built by parents, for parents. Your family's data stays yours.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 2,
  },
  back: { width: 36, alignItems: "flex-start" },
  title: { fontFamily: F.title, fontSize: 12, color: C.primary, letterSpacing: 2 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60, gap: 24 },
  updated: { fontFamily: F.body, fontSize: 14 },
  section: { gap: 8 },
  secTitle: { fontFamily: F.body, fontSize: 13, letterSpacing: 2 },
  secBody: { fontFamily: F.body, fontSize: 17, lineHeight: 26 },
  badge: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderWidth: 2, borderRadius: 2, padding: 16, marginTop: 8,
  },
  badgeText: { flex: 1, fontFamily: F.body, fontSize: 16, lineHeight: 24 },
});
