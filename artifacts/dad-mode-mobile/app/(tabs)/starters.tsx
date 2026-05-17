import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type AgeGroup = "all" | "toddler" | "young" | "tween" | "teen";

const STARTERS: { question: string; ageGroup: AgeGroup; category: string }[] =
  [
    { question: "What was the best part of your day today?", ageGroup: "all", category: "Daily" },
    { question: "If you could have any superpower, what would it be?", ageGroup: "all", category: "Fun" },
    { question: "What's something that made you smile recently?", ageGroup: "all", category: "Feelings" },
    { question: "If you could go anywhere in the world, where would you go?", ageGroup: "all", category: "Dreams" },
    { question: "What's your favorite thing we do together?", ageGroup: "all", category: "Bonding" },

    { question: "What's your favorite animal and why?", ageGroup: "toddler", category: "Fun" },
    { question: "Can you show me your silliest face?", ageGroup: "toddler", category: "Fun" },
    { question: "What does your favorite stuffed animal dream about?", ageGroup: "toddler", category: "Imagination" },
    { question: "If you could eat one food every day, what would it be?", ageGroup: "toddler", category: "Fun" },
    { question: "What sound does your favorite animal make?", ageGroup: "toddler", category: "Learning" },

    { question: "Who is your best friend and what do you like about them?", ageGroup: "young", category: "Social" },
    { question: "What's the hardest thing about school right now?", ageGroup: "young", category: "School" },
    { question: "If you could invent something, what would it be?", ageGroup: "young", category: "Dreams" },
    { question: "What's a rule you think is unfair?", ageGroup: "young", category: "Thinking" },
    { question: "What do you want to be when you grow up?", ageGroup: "young", category: "Dreams" },
    { question: "What's the funniest thing that happened at school?", ageGroup: "young", category: "Daily" },

    { question: "What's something you're proud of lately?", ageGroup: "tween", category: "Growth" },
    { question: "Is there anything you wish you could change about school?", ageGroup: "tween", category: "School" },
    { question: "What's a goal you want to achieve this year?", ageGroup: "tween", category: "Goals" },
    { question: "Who do you look up to and why?", ageGroup: "tween", category: "Values" },
    { question: "What's something you're curious about?", ageGroup: "tween", category: "Learning" },
    { question: "If you could change one thing about the world, what would it be?", ageGroup: "tween", category: "Thinking" },

    { question: "What's been stressing you out lately?", ageGroup: "teen", category: "Feelings" },
    { question: "What's something you've learned this year that surprised you?", ageGroup: "teen", category: "Growth" },
    { question: "What would your dream job look like?", ageGroup: "teen", category: "Future" },
    { question: "How do you feel about where things are going in your life?", ageGroup: "teen", category: "Reflection" },
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

export default function Starters() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<AgeGroup>("all");
  const [copied, setCopied] = useState<number | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered =
    filter === "all"
      ? STARTERS
      : STARTERS.filter(
          (s) => s.ageGroup === "all" || s.ageGroup === filter
        );

  const handleCopy = async (question: string, idx: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(question);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.primary }]}>Starters</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Break the ice with your kids
        </Text>

        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterChip,
                filter === item.value
                  ? { backgroundColor: colors.primary }
                  : {
                      backgroundColor: colors.secondary,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
              ]}
              onPress={() => setFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filter === item.value
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => `${item.ageGroup}-${idx}`}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + 100 },
        ]}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text
                  style={[styles.categoryText, { color: colors.accent }]}
                >
                  {item.category}
                </Text>
              </View>
              <Pressable
                style={[
                  styles.copyBtn,
                  {
                    backgroundColor:
                      copied === index
                        ? colors.accent + "33"
                        : colors.secondary,
                  },
                ]}
                onPress={() => handleCopy(item.question, index)}
              >
                <Feather
                  name={copied === index ? "check" : "copy"}
                  size={14}
                  color={copied === index ? colors.accent : colors.mutedForeground}
                />
              </Pressable>
            </View>
            <Text style={[styles.question, { color: colors.foreground }]}>
              {item.question}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 4,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
  },
  filters: {
    paddingVertical: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  copyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  question: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
  },
});
