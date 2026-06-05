import { useAuth } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
const todayKey = () => `dad-quests-${new Date().toISOString().split("T")[0]}`;

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: dashboard, isLoading, refetch } = useGetDashboard();
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Load today's quest state from persistent storage
  useEffect(() => {
    AsyncStorage.getItem(todayKey())
      .then((val) => { if (val) setCompletedQuests(JSON.parse(val) as string[]); })
      .catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  }).toUpperCase();

  const toggleQuest = (id: string) => {
    setCompletedQuests((prev) => {
      const next = prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id];
      AsyncStorage.setItem(todayKey(), JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

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
            sub={firstKid ? "Open Journal" : "Add a kid"}
            accentColor="#6baed6"
            done={completedQuests.includes("q3")}
            onToggle={() => toggleQuest("q3")}
            onPress={() => router.push(firstKid ? `/kid/${firstKid.id}` : "/(tabs)/kids")}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Feather name="bar-chart-2" size={16} color={C.primary} />
          <Text style={[s.sectionTitle, GLOW]}>Stats</Text>
        </View>
        <View style={s.statsRow}>
          <StatCard icon="users" label="Kids" value={dashboard?.totalChildren ?? 0} color={C.primary} />
          <StatCard icon="book-open" label="Memories" value={dashboard?.totalMemories ?? 0} color="#6baed6" />
          <StatCard icon="check-circle" label="Done" value={dashboard?.completedActivities ?? 0} color={C.accent} />
        </View>
      </View>

      {/* Your Kids */}
      {(dashboard?.childrenSummary?.length ?? 0) > 0 && (
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Feather name="users" size={16} color={C.primary} />
            <Text style={[s.sectionTitle, GLOW]}>Your Party</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.kidsRow}>
            {dashboard!.childrenSummary.map((child) => (
              <KidChip
                key={child.id}
                child={child}
                onPress={() => router.push(`/kid/${child.id}`)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Memory Log */}
      {(dashboard?.recentMemories?.length ?? 0) > 0 && (
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Feather name="book-open" size={16} color={C.primary} />
            <Text style={[s.sectionTitle, GLOW]}>Recent Memories</Text>
          </View>
          <View style={s.memList}>
            {dashboard!.recentMemories.slice(0, 5).map((mem) => (
              <MemoryRow key={mem.id} memory={mem} />
            ))}
          </View>
        </View>
      )}

      {/* Empty state */}
      {(dashboard?.totalChildren ?? 0) === 0 && (
        <View style={s.emptyState}>
          <Feather name="users" size={32} color={C.primary} />
          <Text style={[s.emptyTitle, GLOW]}>YOUR PARTY IS EMPTY</Text>
          <Text style={[s.emptyBody, { color: C.mutedFg }]}>Add your first kid to start the quest.</Text>
          <Pressable
            style={({ pressed }) => [s.emptyBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push("/(tabs)/kids")}
          >
            <Feather name="user-plus" size={16} color={C.primaryFg} />
            <Text style={[s.emptyBtnText, { color: C.primaryFg }]}>ADD A KID</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  container: { paddingHorizontal: 16, gap: 28 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { fontFamily: F.title, fontSize: 11, color: C.primary, letterSpacing: 2 },
  headerDate: { fontFamily: F.body, fontSize: 15, marginTop: 4 },

  section: { gap: 12 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: F.title, fontSize: 11, color: C.primary, letterSpacing: 2 },

  questList: { gap: 10 },
  questCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 2, borderRadius: 2,
    overflow: "hidden",
  },
  questBar: { width: 4, alignSelf: "stretch" },
  questBody: { flex: 1, paddingVertical: 12, paddingHorizontal: 14, gap: 4 },
  questLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  questTitle: { fontFamily: F.body, fontSize: 18 },
  questSub: { fontFamily: F.body, fontSize: 14 },
  questCheck: { width: 40, height: 40, marginRight: 12, borderRadius: 2, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  questCheckInner: { width: 18, height: 18, borderRadius: 1, borderWidth: 2 },

  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: C.card, borderWidth: 2, borderRadius: 2,
    paddingVertical: 14, alignItems: "center", gap: 6,
  },
  statValue: { fontFamily: F.title, fontSize: 20, color: C.fg },
  statLabel: { fontFamily: F.body, fontSize: 13, textAlign: "center" },

  kidsRow: { gap: 10, paddingRight: 4 },
  kidChip: {
    backgroundColor: C.card, borderWidth: 2, borderRadius: 2,
    padding: 12, alignItems: "center", gap: 6, minWidth: 90,
  },
  kidAvatar: { width: 44, height: 44, borderRadius: 2, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  kidAvatarText: { fontFamily: F.title, fontSize: 18 },
  kidName: { fontFamily: F.body, fontSize: 16, maxWidth: 88, textAlign: "center" },
  kidAge: { fontFamily: F.body, fontSize: 13 },
  kidLevel: { fontFamily: F.body, fontSize: 14 },

  memList: { gap: 8 },
  memRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: C.card, borderWidth: 2, borderRadius: 2, padding: 12,
  },
  memIcon: { width: 32, height: 32, borderRadius: 2, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  memTitle: { fontFamily: F.body, fontSize: 17 },
  memBody: { fontFamily: F.body, fontSize: 14, lineHeight: 20 },
  memDate: { fontFamily: F.body, fontSize: 13, flexShrink: 0 },

  emptyState: { alignItems: "center", gap: 12, paddingVertical: 32 },
  emptyTitle: { fontFamily: F.title, fontSize: 11, color: C.fg, textAlign: "center" },
  emptyBody: { fontFamily: F.body, fontSize: 17, textAlign: "center", maxWidth: 260 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 2, marginTop: 8 },
  emptyBtnText: { fontFamily: F.body, fontSize: 16, letterSpacing: 1 },
});
