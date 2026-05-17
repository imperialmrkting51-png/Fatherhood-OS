import { useAuth } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetDashboard, useListChildren } from "@workspace/api-client-react";
import type { ChildSummary, Memory } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { FONTS } from "@/constants/fonts";

const AVATAR_COLORS = [
  "#e8a045",
  "#6baed6",
  "#84cc16",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
];

function getAvatarColor(color: string): string {
  return AVATAR_COLORS.includes(color) ? color : AVATAR_COLORS[0];
}

function AgeLabel({ years, months }: { years: number; months: number }) {
  const colors = useColors();
  const label =
    years === 0 ? `${months}mo` : months > 0 ? `${years}y ${months}mo` : `${years}y`;
  return (
    <Text style={[styles.ageLabel, { color: colors.mutedForeground }]}>
      {label}
    </Text>
  );
}

function ChildCard({ child, onPress }: { child: ChildSummary; onPress: () => void }) {
  const colors = useColors();
  const avatarColor = getAvatarColor(child.avatarColor);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.childCard,
        {
          backgroundColor: colors.card,
          borderColor: avatarColor + "88",
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor + "22", borderColor: avatarColor + "66" }]}>
        <Text style={[styles.avatarInitial, { color: avatarColor }]}>
          {child.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.childName, { color: colors.foreground }]} numberOfLines={1}>
        {child.name}
      </Text>
      <AgeLabel years={child.ageYears} months={child.ageMonths} />
      <View style={styles.childStats}>
        <View style={styles.childStat}>
          <Feather name="book" size={11} color={colors.primary} />
          <Text style={[styles.childStatText, { color: colors.mutedForeground }]}>
            {child.memoryCount}
          </Text>
        </View>
        <View style={styles.childStat}>
          <Feather name="check-circle" size={11} color="#84cc16" />
          <Text style={[styles.childStatText, { color: colors.mutedForeground }]}>
            {child.activityCount}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function MemoryRow({ memory }: { memory: Memory }) {
  const colors = useColors();
  const date = new Date(memory.date);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const moodEmoji: Record<string, string> = {
    happy: "😄",
    proud: "🌟",
    funny: "😂",
    bittersweet: "🥲",
    grateful: "🙏",
  };

  return (
    <View
      style={[
        styles.memoryRow,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.memoryDot, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" }]}>
        <Feather name="book-open" size={14} color={colors.primary} />
      </View>
      <View style={styles.memoryContent}>
        <Text style={[styles.memoryTitle, { color: colors.foreground }]} numberOfLines={1}>
          {memory.mood && moodEmoji[memory.mood] ? `${moodEmoji[memory.mood]} ` : ""}
          {memory.title}
        </Text>
        {memory.body ? (
          <Text style={[styles.memoryBody, { color: colors.mutedForeground }]} numberOfLines={2}>
            {memory.body}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.memoryDate, { color: colors.mutedForeground }]}>
        {formatted}
      </Text>
    </View>
  );
}

export default function Dashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: dashboard, isLoading, refetch } = useGetDashboard();

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {greeting}, dad
          </Text>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            DAD MODE
          </Text>
        </View>
        <View style={[styles.xpBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="zap" size={14} color={colors.primary} />
          <Text style={[styles.xpText, { color: colors.primary }]}>
            LVL UP
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          {
            label: "KIDS",
            value: dashboard?.totalChildren ?? 0,
            icon: "users" as const,
            color: "#6baed6",
          },
          {
            label: "MEMORIES",
            value: dashboard?.totalMemories ?? 0,
            icon: "book-open" as const,
            color: colors.primary,
          },
          {
            label: "DONE",
            value: dashboard?.completedActivities ?? 0,
            icon: "check-circle" as const,
            color: "#84cc16",
          },
        ].map((stat) => (
          <View
            key={stat.label}
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name={stat.icon} size={20} color={stat.color} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {dashboard?.childrenSummary && dashboard.childrenSummary.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              YOUR KIDS
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/kids")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                SEE ALL →
              </Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.childRow}>
              {dashboard.childrenSummary.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onPress={() => router.push(`/kid/${child.id}`)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.emptyKids,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={() => router.push("/(tabs)/kids")}
        >
          <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <Feather name="user-plus" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyKidsText, { color: colors.foreground }]}>
            ADD FIRST KID
          </Text>
          <Text style={[styles.emptyKidsSubtext, { color: colors.mutedForeground }]}>
            Track activities, memories{"\n"}and get age-based guidance
          </Text>
        </Pressable>
      )}

      {dashboard?.recentMemories && dashboard.recentMemories.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            RECENT MEMORIES
          </Text>
          <View style={styles.memoriesList}>
            {dashboard.recentMemories.slice(0, 5).map((memory) => (
              <MemoryRow key={memory.id} memory={memory} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 20,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    gap: 4,
  },
  greeting: {
    fontSize: 16,
    fontFamily: FONTS.pixel,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: FONTS.title,
    letterSpacing: 3,
    textShadowColor: "rgba(232,160,69,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderRadius: 2,
  },
  xpText: {
    fontSize: 13,
    fontFamily: FONTS.pixel,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 2,
    borderWidth: 2,
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontFamily: FONTS.title,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.pixel,
    letterSpacing: 1,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.pixel,
    letterSpacing: 2,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: FONTS.pixel,
  },
  childRow: {
    flexDirection: "row",
    gap: 10,
  },
  childCard: {
    width: 110,
    borderRadius: 2,
    borderWidth: 2,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontFamily: FONTS.title,
  },
  childName: {
    fontSize: 14,
    fontFamily: FONTS.pixel,
    textAlign: "center",
  },
  ageLabel: {
    fontSize: 13,
    fontFamily: FONTS.pixel,
  },
  childStats: {
    flexDirection: "row",
    gap: 8,
  },
  childStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  childStatText: {
    fontSize: 13,
    fontFamily: FONTS.pixel,
  },
  emptyKids: {
    borderWidth: 2,
    borderRadius: 2,
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyKidsText: {
    fontSize: 14,
    fontFamily: FONTS.title,
    letterSpacing: 1,
    textAlign: "center",
  },
  emptyKidsSubtext: {
    fontSize: 16,
    fontFamily: FONTS.pixel,
    textAlign: "center",
    lineHeight: 22,
  },
  memoriesList: {
    gap: 8,
  },
  memoryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 2,
    borderWidth: 2,
    padding: 12,
  },
  memoryDot: {
    width: 34,
    height: 34,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  memoryContent: {
    flex: 1,
    gap: 3,
  },
  memoryTitle: {
    fontSize: 16,
    fontFamily: FONTS.pixel,
  },
  memoryBody: {
    fontSize: 14,
    fontFamily: FONTS.pixel,
    lineHeight: 20,
  },
  memoryDate: {
    fontSize: 13,
    fontFamily: FONTS.pixel,
    flexShrink: 0,
    marginTop: 2,
  },
});
