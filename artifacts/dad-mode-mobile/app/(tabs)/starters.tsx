import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, GLOW } from "@/constants/theme";

type AgeGroup = "all" | "toddler" | "young" | "tween" | "teen";

const STARTERS: { question: string; ageGroup: AgeGroup; category: string }[] = [
  { question: "What was the best part of your day today?", ageGroup: "all", category: "Daily" },
  { question: "If you could have any superpower, what would it be?", ageGroup: "all", category: "Fun" },
  { question: "What's something that made you smile recently?", ageGroup: "all", category: "Feelings" },
  { question: "If you could go anywhere in the world, where?", ageGroup: "all", category: "Dreams" },
  { question: "What's your favorite thing we do together?", ageGroup: "all", category: "Bonding" },
  { question: "What's your favorite animal and why?", ageGroup: "toddler", category: "Fun" },
  { question: "Can you show me your silliest face?", ageGroup: "toddler", category: "Fun" },
  { question: "What does your stuffed animal dream about?", ageGroup: "toddler", category: "Imagination" },
  { question: "If you could eat one food every day, what would it be?", ageGroup: "toddler", category: "Fun" },
  { question: "Who is your best friend and what do you like about them?", ageGroup: "young", category: "Social" },
  { question: "What's the hardest thing about school right now?", ageGroup: "young", category: "School" },
  { question: "If you could invent something, what would it be?", ageGroup: "young", category: "Dreams" },
  { question: "What's a rule you think is unfair?", ageGroup: "young", category: "Thinking" },
  { question: "What do you want to be when you grow up?", ageGroup: "young", category: "Dreams" },
  { question: "What's something you're proud of lately?", ageGroup: "tween", category: "Growth" },
  { question: "What's a goal you want to achieve this year?", ageGroup: "tween", category: "Goals" },
  { question: "Who do you look up to and why?", ageGroup: "tween", category: "Values" },
  { question: "If you could change one thing about the world, what?", ageGroup: "tween", category: "Thinking" },
  { question: "What's been stressing you out lately?", ageGroup: "teen", category: "Feelings" },
  { question: "What would your dream job look like?", ageGroup: "teen", category: "Future" },
  { question: "How do you feel about where life is going?", ageGroup: "teen", category: "Reflection" },
  { question: "Is there anything I could do differently as a dad?", ageGroup: "teen", category: "Bonding" },
  { question: "What's a value that's really important to you?", ageGroup: "teen", category: "Values" },
];

const FILTERS: { label: string; value: AgeGroup }[] = [
  { label: "All Ages", value: "all" },
  { label: "Toddler", value: "toddler" },
  { label: "Young", value: "young" },
  { label: "Tween", value: "tween" },
  { label: "Teen", value: "teen" },
];

const CAT_COLOR: Record<string, string> = {
  Daily: "#e8a045", Fun: "#ec4899", Feelings: "#6baed6", Dreams: "#a855f7",
  Bonding: "#14b8a6", Imagination: "#a855f7", Social: "#6baed6", School: "#f59e0b",
  Thinking: "#14b8a6", Growth: "#84cc16", Goals: "#e8a045", Values: "#ec4899",
  Future: "#a855f7", Reflection: "#6baed6",
};

export default function Starters() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<AgeGroup>("all");
  const [copied, setCopied] = useState<number | null>(null);

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const items =
    filter === "all"
      ? STARTERS
      : STARTERS.filter((s) => s.ageGroup === "all" || s.ageGroup === filter);

  const handleCopy = async (q: string, i: number) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(q);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <View style={s.flex}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 16 }]}>
        <View style={s.titleRow}>
          <Feather name="message-circle" size={18} color={C.primary} />
          <Text style={[s.pageTitle, GLOW]}>STARTERS</Text>
        </View>
        <Text style={[s.subtitle, { color: C.mutedFg }]}>Break the ice with your kids</Text>

        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
          renderItem={({ item }) => {
            const active = filter === item.value;
            return (
              <Pressable
                style={[s.chip, { backgroundColor: active ? C.primary : C.card, borderColor: active ? C.primary : C.border }]}
                onPress={() => setFilter(item.value)}
              >
                <Text style={[s.chipText, { color: active ? C.primaryFg : C.mutedFg }]}>{item.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Cards */}
      <FlatList
        data={items}
        keyExtractor={(item, i) => `${item.ageGroup}-${i}`}
        contentContainerStyle={[s.list, { paddingBottom: bottomPad + 100 }]}
        renderItem={({ item, index }) => {
          const col = CAT_COLOR[item.category] ?? C.primary;
          const isCopied = copied === index;
          return (
            <View style={[s.card, { borderColor: col + "66" }]}>
              <View style={[s.cardBar, { backgroundColor: col }]} />
              <View style={{ flex: 1, padding: 14, gap: 8 }}>
                <View style={s.cardTop}>
                  <View style={[s.badge, { backgroundColor: col + "22", borderColor: col + "55" }]}>
                    <Text style={[s.badgeText, { color: col }]}>{item.category.toUpperCase()}</Text>
                  </View>
                  <Pressable
                    style={[s.copyBtn, { backgroundColor: isCopied ? "#84cc16" + "33" : C.secondary, borderColor: isCopied ? "#84cc16" : C.border }]}
                    onPress={() => handleCopy(item.question, index)}
                  >
                    <Feather name={isCopied ? "check" : "copy"} size={14} color={isCopied ? "#84cc16" : C.mutedFg} />
                  </Pressable>
                </View>
                <Text style={[s.question, { color: C.fg }]}>{item.question}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 20, paddingBottom: 14, gap: 6,
    borderBottomWidth: 2, borderBottomColor: C.border, backgroundColor: C.bg,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pageTitle: { fontFamily: F.title, fontSize: 14, color: C.primary },
  subtitle: { fontFamily: F.body, fontSize: 18 },
  filters: { paddingVertical: 4, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 2, borderWidth: 2 },
  chipText: { fontFamily: F.body, fontSize: 15 },
  list: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  card: {
    flexDirection: "row", backgroundColor: C.card,
    borderWidth: 2, borderRadius: 2, overflow: "hidden",
  },
  cardBar: { width: 4, alignSelf: "stretch" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2, borderWidth: 1 },
  badgeText: { fontFamily: F.body, fontSize: 12, letterSpacing: 1 },
  copyBtn: { width: 32, height: 32, borderRadius: 2, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  question: { fontFamily: F.body, fontSize: 18, lineHeight: 26 },
});
