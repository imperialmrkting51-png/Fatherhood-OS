import { useAuth } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
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
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor + "33" }]}>
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
          <Feather name="book" size={11} color={colors.accent} />
          <Text style={[styles.childStatText, { color: colors.mutedForeground }]}>
            {child.memoryCount}
          </Text>
        </View>
        <View style={styles.childStat}>
          <Feather name="check-circle" size={11} color={colors.primary} />
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
      <View
        style={[styles.memoryDot, { backgroundColor: colors.primary + "44" }]}
      >
        <Feather name="book-open" size={14} color={colors.primary} />
      </View>
      <View style={styles.memoryContent}>
        <Text
          style={[styles.memoryTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {memory.mood && moodEmoji[memory.mood]
            ? `${moodEmoji[memory.mood]} `
            : ""}
          {memory.title}
        </Text>
        {memory.body ? (
          <Text
            style={[styles.memoryBody, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
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
  const { userId } = useAuth();

  const { data: dashboard, isLoading, refetch } = useGetDashboard();
  const { data: children } = useListChildren();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
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
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {greeting}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            DAD MODE
          </Text>
        </View>
        <View
          style={[styles.xpBadge, { backgroundColor: colors.secondary }]}
        >
          <Feather name="zap" size={14} color={colors.primary} />
          <Text style={[styles.xpText, { color: colors.primary }]}>
            Level up!
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          {
            label: "Kids",
            value: dashboard?.totalChildren ?? 0,
            icon: "users" as const,
            color: colors.accent,
          },
          {
            label: "Memories",
            value: dashboard?.totalMemories ?? 0,
            icon: "book-open" as const,
            color: colors.primary,
          },
          {
            label: "Done",
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
            <Feather name={stat.icon} size={18} color={stat.color} />
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
              Your kids
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/kids")}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>
                See all
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
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={() => router.push("/(tabs)/kids")}
        >
          <Feather name="user-plus" size={24} color={colors.primary} />
          <Text style={[styles.emptyKidsText, { color: colors.foreground }]}>
            Add your first kid
          </Text>
          <Text
            style={[styles.emptyKidsSubtext, { color: colors.mutedForeground }]}
          >
            Track activities, memories and get age-based guidance
          </Text>
        </Pressable>
      )}

      {dashboard?.recentMemories && dashboard.recentMemories.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recent memories
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
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
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
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  childRow: {
    flexDirection: "row",
    gap: 10,
  },
  childCard: {
    width: 110,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  childName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  ageLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
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
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  emptyKids: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    padding: 28,
    gap: 8,
  },
  emptyKidsText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  emptyKidsSubtext: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  memoriesList: {
    gap: 8,
  },
  memoryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  memoryDot: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  memoryContent: {
    flex: 1,
    gap: 2,
  },
  memoryTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  memoryBody: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  memoryDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flexShrink: 0,
    marginTop: 2,
  },
});
