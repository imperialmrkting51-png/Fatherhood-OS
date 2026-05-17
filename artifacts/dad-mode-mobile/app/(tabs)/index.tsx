import { useAuth } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useGetDashboard } from "@workspace/api-client-react";
import type { ChildSummary, Memory } from "@workspace/api-client-react";
import { C, F, AVATAR_COLORS, GLOW } from "@/constants/theme";

// ─── Quest card ─────────────────────────────────────────────────────────────
function QuestCard({
  icon,
  label,
  sub,
  accentColor,
  done,
  onToggle,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  sub: string;
  accentColor: string;
  done: boolean;
  onToggle: () => void;
  onPress: () => void;
}) {
  return (
    <Pressable style={[s.questCard, { borderColor: C.border }]} onPress={onPress}>
      <View style={[s.questBar, { backgroundColor: accentColor }]} />
      <View style={s.questBody}>
        <View style={s.questLabel}>
          <Feather name={icon} size={14} color={accentColor} />
          <Text style={[s.questTitle, { color: C.fg }]}>{label}</Text>
        </View>
        <Text style={[s.questSub, { color: C.primary }]}>{sub} →</Text>
      </View>
      <Pressable
        style={[
          s.questCheck,
          { borderColor: accentColor, backgroundColor: done ? accentColor + "33" : "transparent" },
        ]}
        onPress={onToggle}
        hitSlop={10}
      >
        {done ? (
          <Feather name="check-circle" size={20} color={accentColor} />
        ) : (
          <View style={[s.questCheckInner, { borderColor: accentColor }]} />
        )}
      </Pressable>
    </Pressable>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; value: number; color: string }) {
  return (
    <View style={[s.statCard, { borderColor: C.border }]}>
      <Feather name={icon} size={20} color={color} />
      <Text style={[s.statValue, GLOW]}>{value}</Text>
      <Text style={[s.statLabel, { color: C.mutedFg }]}>{label}</Text>
    </View>
  );
}

// ─── Kid chip ────────────────────────────────────────────────────────────────
function KidChip({ child, onPress }: { child: ChildSummary; onPress: () => void }) {
  const color = AVATAR_COLORS.includes(child.avatarColor as typeof AVATAR_COLORS[number])
    ? child.avatarColor
    : AVATAR_COLORS[0];
  const age =
    child.ageYears === 0
      ? `${child.ageMonths}mo`
      : child.ageMonths > 0
      ? `${child.ageYears}y ${child.ageMonths}mo`
      : `${child.ageYears}y`;
  return (
    <Pressable
      style={({ pressed }) => [s.kidChip, { borderColor: color + "88", opacity: pressed ? 0.8 : 1 }]}
      onPress={onPress}
    >
      <View style={[s.kidAvatar, { backgroundColor: color + "22", borderColor: color }]}>
        <Text style={[s.kidAvatarText, { color }]}>{child.name[0].toUpperCase()}</Text>
      </View>
      <Text style={[s.kidName, { color: C.fg }]} numberOfLines={1}>{child.name}</Text>
      <Text style={[s.kidAge, { color: C.mutedFg }]}>{age}</Text>
      <Text style={[s.kidLevel, { color: C.primary }]}>
        LVL {Math.floor((child.memoryCount || 0) / 5) + 1}
      </Text>
    </Pressable>
  );
}

// ─── Memory row ──────────────────────────────────────────────────────────────
function MemoryRow({ memory }: { memory: Memory }) {
  const MOOD: Record<string, string> = {
    happy: "😄", proud: "🌟", funny: "😂", bittersweet: "🥲", grateful: "🙏",
  };
  const date = new Date(memory.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return (
    <View style={[s.memRow, { borderColor: C.border }]}>
      <View style={[s.memIcon, { backgroundColor: C.primary + "22", borderColor: C.primary + "55" }]}>
        <Feather name="book-open" size={14} color={C.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[s.memTitle, { color: C.fg }]} numberOfLines={1}>
          {memory.mood && MOOD[memory.mood] ? `${MOOD[memory.mood]} ` : ""}{memory.title}
        </Text>
        {memory.body ? (
          <Text style={[s.memBody, { color: C.mutedFg }]} numberOfLines={2}>{memory.body}</Text>
        ) : null}
      </View>
      <Text style={[s.memDate, { color: C.mutedFg }]}>{date}</Text>
    </View>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: dashboard, isLoading, refetch } = useGetDashboard();
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  }).toUpperCase();

  const toggleQuest = (id: string) =>
    setCompletedQuests((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );

  if (isLoading) {
    return (
      <View style={[s.loading, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const firstKid = dashboard?.childrenSummary?.[0];

  return (
    <ScrollView
      style={{ backgroundColor: C.bg }}
      contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={[s.headerTitle, GLOW]}>INSERT COIN TO CONTINUE.</Text>
          <Text style={[s.headerDate, { color: C.mutedFg }]}>{today}</Text>
        </View>
      </View>

      {/* Daily Quests */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Feather name="check-square" size={16} color={C.primary} />
          <Text style={[s.sectionTitle, GLOW]}>Daily Quests</Text>
        </View>
        <View style={s.questList}>
          <QuestCard
            icon="message-circle"
            label="Ask 3 Questions"
            sub="Go to Starters"
            accentColor={C.primary}
            done={completedQuests.includes("q1")}
            onToggle={() => toggleQuest("q1")}
            onPress={() => router.push("/(tabs)/starters")}
          />
          <QuestCard
            icon="activity"
            label="Micro-Activity"
            sub={firstKid ? "Start Activity" : "Add a kid"}
            accentColor={C.accent}
            done={completedQuests.includes("q2")}
            onToggle={() => toggleQuest("q2")}
            onPress={() => router.push(firstKid ? `/kid/${firstKid.id}` : "/(tabs)/kids")}
          />
          <QuestCard
            icon="book"
            label="Log a Memory"
            sub={firstKid ? "Growth Check" : "Add a kid"}
            accentColor="#3b82f6"
            done={completedQuests.includes("q3")}
            onToggle={() => toggleQuest("q3")}
            onPress={() => router.push(firstKid ? `/kid/${firstKid.id}` : "/(tabs)/kids")}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <StatCard icon="users" label="Kids" value={dashboard?.totalChildren ?? 0} color={C.primary} />
        <StatCard icon="book-open" label="Memories" value={dashboard?.totalMemories ?? 0} color={C.accent} />
        <StatCard icon="check-circle" label="Done" value={dashboard?.completedActivities ?? 0} color={C.green} />
      </View>

      {/* Memory Log */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, GLOW]}>Memory Log</Text>

        {!dashboard?.recentMemories?.length ? (
          <View style={[s.emptyCard, { borderColor: C.border }]}>
            <View style={[s.emptyIcon, { backgroundColor: C.secondary, borderColor: C.primary + "55" }]}>
              <Feather name="book" size={28} color={C.mutedFg} />
            </View>
            <Text style={[s.emptyTitle, { color: C.fg }]}>No memories logged</Text>
            <Text style={[s.emptyBody, { color: C.mutedFg }]}>
              Complete the "Log a Memory" quest to see it here.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {dashboard.recentMemories.slice(0, 5).map((m) => (
              <MemoryRow key={m.id} memory={m} />
            ))}
          </View>
        )}
      </View>

      {/* Your Party */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, GLOW]}>Your Kids</Text>

        {!dashboard?.childrenSummary?.length ? (
          <View style={[s.emptyCard, { borderColor: C.border }]}>
            <Text style={[s.emptyBody, { color: C.mutedFg }]}>Your party is empty.</Text>
            <Pressable
              style={({ pressed }) => [s.emptyBtn, { borderColor: C.primary, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push("/(tabs)/kids")}
            >
              <Text style={[s.emptyBtnText, { color: C.primary }]}>Add Kid</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {dashboard.childrenSummary.map((child) => (
                <KidChip key={child.id} child={child} onPress={() => router.push(`/kid/${child.id}`)} />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  container: { paddingHorizontal: 20, gap: 28 },

  header: { gap: 6 },
  headerTitle: { fontFamily: F.title, fontSize: 11, color: C.fg, lineHeight: 20 },
  headerDate: { fontFamily: F.body, fontSize: 18, marginTop: 6 },

  section: { gap: 12 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: F.title, fontSize: 9, color: C.fg },

  questList: { gap: 10 },
  questCard: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  questBar: { width: 4, alignSelf: "stretch" },
  questBody: { flex: 1, padding: 14, gap: 4 },
  questLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  questTitle: { fontFamily: F.body, fontSize: 18 },
  questSub: { fontFamily: F.body, fontSize: 17 },
  questCheck: {
    width: 42,
    height: 42,
    margin: 12,
    borderWidth: 2,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  questCheckInner: { width: 18, height: 18, borderWidth: 2, borderRadius: 0 },

  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 2,
    borderRadius: 2,
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
  },
  statValue: { fontFamily: F.title, fontSize: 22, color: C.fg },
  statLabel: { fontFamily: F.body, fontSize: 14, letterSpacing: 1 },

  kidChip: {
    width: 110,
    backgroundColor: C.card,
    borderWidth: 2,
    borderRadius: 2,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  kidAvatar: {
    width: 44,
    height: 44,
    borderRadius: 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  kidAvatarText: { fontFamily: F.title, fontSize: 16 },
  kidName: { fontFamily: F.body, fontSize: 16, textAlign: "center" },
  kidAge: { fontFamily: F.body, fontSize: 14 },
  kidLevel: { fontFamily: F.body, fontSize: 15 },

  memRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: C.card,
    borderWidth: 2,
    borderRadius: 2,
    padding: 12,
  },
  memIcon: {
    width: 34,
    height: 34,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  memTitle: { fontFamily: F.body, fontSize: 17 },
  memBody: { fontFamily: F.body, fontSize: 15, lineHeight: 20 },
  memDate: { fontFamily: F.body, fontSize: 14, flexShrink: 0, marginTop: 2 },

  emptyCard: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderRadius: 2,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: F.title, fontSize: 9, textAlign: "center" },
  emptyBody: { fontFamily: F.body, fontSize: 17, textAlign: "center", lineHeight: 24 },
  emptyBtn: {
    borderWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  emptyBtnText: { fontFamily: F.body, fontSize: 18, letterSpacing: 1 },
});
