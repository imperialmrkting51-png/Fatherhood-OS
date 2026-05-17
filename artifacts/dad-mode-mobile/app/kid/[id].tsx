import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetChild,
  useGetChildGuidance,
  useListChildActivities,
  useListChildMemories,
  useCreateChildActivity,
  useCreateChildMemory,
  useUpdateActivity,
  useDeleteActivity,
  useDeleteMemory,
} from "@workspace/api-client-react";
import type {
  Activity,
  Memory,
  AgeGuidance,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

type Tab = "guide" | "activities" | "memories";

const MOODS = ["happy", "proud", "funny", "bittersweet", "grateful"] as const;
const MOOD_EMOJI: Record<string, string> = {
  happy: "😄",
  proud: "🌟",
  funny: "😂",
  bittersweet: "🥲",
  grateful: "🙏",
};

function ActivityItem({
  activity,
  onToggle,
  onDelete,
}: {
  activity: Activity;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.activityItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Pressable
        style={[
          styles.checkbox,
          {
            backgroundColor: activity.completed
              ? colors.primary + "33"
              : colors.secondary,
            borderColor: activity.completed ? colors.primary : colors.border,
          },
        ]}
        onPress={onToggle}
      >
        {activity.completed && (
          <Feather name="check" size={14} color={colors.primary} />
        )}
      </Pressable>
      <View style={styles.activityContent}>
        <Text
          style={[
            styles.activityTitle,
            {
              color: activity.completed
                ? colors.mutedForeground
                : colors.foreground,
              textDecorationLine: activity.completed
                ? "line-through"
                : "none",
            },
          ]}
        >
          {activity.title}
        </Text>
        {activity.description ? (
          <Text
            style={[styles.activityDesc, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {activity.description}
          </Text>
        ) : null}
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Text style={[styles.categoryText, { color: colors.accent }]}>
            {activity.category}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onDelete}
        style={styles.deleteBtn}
      >
        <Feather name="trash-2" size={15} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}

function MemoryCard({
  memory,
  onDelete,
}: {
  memory: Memory;
  onDelete: () => void;
}) {
  const colors = useColors();
  const date = new Date(memory.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <View
      style={[
        styles.memoryCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.memoryCardTop}>
        <View style={styles.memoryMeta}>
          {memory.mood ? (
            <Text style={styles.moodEmoji}>
              {MOOD_EMOJI[memory.mood] ?? ""}
            </Text>
          ) : null}
          <Text style={[styles.memoryDate, { color: colors.mutedForeground }]}>
            {date}
          </Text>
        </View>
        <Pressable onPress={onDelete}>
          <Feather name="trash-2" size={15} color={colors.mutedForeground} />
        </Pressable>
      </View>
      <Text style={[styles.memoryTitle, { color: colors.foreground }]}>
        {memory.title}
      </Text>
      {memory.body ? (
        <Text
          style={[styles.memoryBody, { color: colors.mutedForeground }]}
          numberOfLines={4}
        >
          {memory.body}
        </Text>
      ) : null}
    </View>
  );
}

function GuideTab({
  guidance,
  isLoading,
}: {
  guidance?: AgeGuidance;
  isLoading: boolean;
}) {
  const colors = useColors();
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!guidance) return null;
  return (
    <ScrollView
      contentContainerStyle={styles.guideContent}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.stageBadge,
          { backgroundColor: colors.primary + "22" },
        ]}
      >
        <Text style={[styles.stageName, { color: colors.primary }]}>
          {guidance.stageName}
        </Text>
        <Text
          style={[styles.stageAge, { color: colors.mutedForeground }]}
        >
          {guidance.ageYears}y {guidance.ageMonths}mo
        </Text>
      </View>

      <Text style={[styles.guideDesc, { color: colors.foreground }]}>
        {guidance.description}
      </Text>

      <Text style={[styles.guideSection, { color: colors.accent }]}>
        DAD TIPS
      </Text>
      {guidance.tips.map((tip, i) => (
        <View key={i} style={styles.tipRow}>
          <Feather name="check-circle" size={14} color={colors.primary} style={{ marginTop: 2 }} />
          <Text style={[styles.tipText, { color: colors.foreground }]}>
            {tip}
          </Text>
        </View>
      ))}

      <Text style={[styles.guideSection, { color: colors.accent }]}>
        SUGGESTED ACTIVITIES
      </Text>
      {guidance.suggestedActivities.map((act, i) => (
        <View key={i} style={styles.tipRow}>
          <Feather name="zap" size={14} color={colors.primary} style={{ marginTop: 2 }} />
          <Text style={[styles.tipText, { color: colors.foreground }]}>
            {act}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

export default function KidDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const childId = Number(id);

  const [tab, setTab] = useState<Tab>("guide");

  const { data: child } = useGetChild({ id: childId });
  const { data: guidance, isLoading: guidanceLoading } = useGetChildGuidance({ id: childId });
  const {
    data: activities,
    refetch: refetchActivities,
  } = useListChildActivities({ id: childId });
  const {
    data: memories,
    refetch: refetchMemories,
  } = useListChildMemories({ id: childId });

  const { mutateAsync: createActivity } = useCreateChildActivity();
  const { mutateAsync: createMemory } = useCreateChildMemory();
  const { mutateAsync: updateActivity } = useUpdateActivity();
  const { mutateAsync: deleteActivity } = useDeleteActivity();
  const { mutateAsync: deleteMemory } = useDeleteMemory();

  const [showAddActivity, setShowAddActivity] = useState(false);
  const [actTitle, setActTitle] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actCategory, setActCategory] = useState("play");
  const [savingAct, setSavingAct] = useState(false);

  const [showAddMemory, setShowAddMemory] = useState(false);
  const [memTitle, setMemTitle] = useState("");
  const [memBody, setMemBody] = useState("");
  const [memDate, setMemDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [memMood, setMemMood] = useState<string>("");
  const [savingMem, setSavingMem] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleAddActivity = async () => {
    if (!actTitle.trim()) return;
    setSavingAct(true);
    try {
      await createActivity({
        id: childId,
        data: {
          title: actTitle.trim(),
          description: actDesc.trim() || undefined,
          category: actCategory,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddActivity(false);
      setActTitle("");
      setActDesc("");
      refetchActivities();
    } finally {
      setSavingAct(false);
    }
  };

  const handleAddMemory = async () => {
    if (!memTitle.trim()) return;
    setSavingMem(true);
    try {
      await createMemory({
        id: childId,
        data: {
          title: memTitle.trim(),
          body: memBody.trim() || undefined,
          date: memDate,
          mood: memMood || undefined,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddMemory(false);
      setMemTitle("");
      setMemBody("");
      setMemMood("");
      refetchMemories();
    } finally {
      setSavingMem(false);
    }
  };

  const toggleActivity = async (activity: Activity) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateActivity({
      id: activity.id,
      data: { completed: !activity.completed },
    });
    refetchActivities();
  };

  const confirmDeleteActivity = (activity: Activity) => {
    Alert.alert("Delete activity?", activity.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteActivity({ id: activity.id });
          refetchActivities();
        },
      },
    ]);
  };

  const confirmDeleteMemory = (memory: Memory) => {
    Alert.alert("Delete memory?", memory.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMemory({ id: memory.id });
          refetchMemories();
        },
      },
    ]);
  };

  const avatarColor = child?.avatarColor ?? colors.primary;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View
            style={[
              styles.headerAvatar,
              { backgroundColor: avatarColor + "33" },
            ]}
          >
            <Text style={[styles.headerAvatarText, { color: avatarColor }]}>
              {child?.name.charAt(0).toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text style={[styles.headerName, { color: colors.foreground }]}>
            {child?.name ?? ""}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {(["guide", "activities", "memories"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            style={[
              styles.tabBtn,
              t === tab && {
                borderBottomWidth: 2,
                borderBottomColor: colors.primary,
              },
            ]}
            onPress={() => setTab(t)}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    t === tab ? colors.primary : colors.mutedForeground,
                  fontFamily:
                    t === tab ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "guide" && (
        <GuideTab guidance={guidance} isLoading={guidanceLoading} />
      )}

      {tab === "activities" && (
        <View style={styles.flex}>
          <FlatList
            data={activities ?? []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={[
              styles.tabList,
              { paddingBottom: bottomPad + 100 },
            ]}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="check-circle" size={28} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No activities yet
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <ActivityItem
                activity={item}
                onToggle={() => toggleActivity(item)}
                onDelete={() => confirmDeleteActivity(item)}
              />
            )}
          />
          <Pressable
            style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomPad + 90 }]}
            onPress={() => {
              setActTitle("");
              setActDesc("");
              setShowAddActivity(true);
            }}
          >
            <Feather name="plus" size={22} color={colors.primaryForeground} />
          </Pressable>
        </View>
      )}

      {tab === "memories" && (
        <View style={styles.flex}>
          <FlatList
            data={memories ?? []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={[
              styles.tabList,
              { paddingBottom: bottomPad + 100 },
            ]}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="book-open" size={28} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No memories yet
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <MemoryCard
                memory={item}
                onDelete={() => confirmDeleteMemory(item)}
              />
            )}
          />
          <Pressable
            style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomPad + 90 }]}
            onPress={() => {
              setMemTitle("");
              setMemBody("");
              setMemDate(new Date().toISOString().split("T")[0]);
              setMemMood("");
              setShowAddMemory(true);
            }}
          >
            <Feather name="plus" size={22} color={colors.primaryForeground} />
          </Pressable>
        </View>
      )}

      <Modal
        visible={showAddActivity}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddActivity(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAddActivity(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <View
                  style={[
                    styles.modalSheet,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.modalHandle}>
                    <View
                      style={[
                        styles.handleBar,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.modalTitle, { color: colors.foreground }]}
                  >
                    Add Activity
                  </Text>
                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    placeholder="Activity title"
                    placeholderTextColor={colors.mutedForeground}
                    value={actTitle}
                    onChangeText={setActTitle}
                    autoFocus
                  />
                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    placeholder="Description (optional)"
                    placeholderTextColor={colors.mutedForeground}
                    value={actDesc}
                    onChangeText={setActDesc}
                  />
                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    placeholder="Category (e.g. play, learning, outdoor)"
                    placeholderTextColor={colors.mutedForeground}
                    value={actCategory}
                    onChangeText={setActCategory}
                  />
                  <Pressable
                    style={[
                      styles.modalSaveBtn,
                      {
                        backgroundColor:
                          !actTitle.trim() || savingAct
                            ? colors.muted
                            : colors.primary,
                      },
                    ]}
                    onPress={handleAddActivity}
                    disabled={!actTitle.trim() || savingAct}
                  >
                    {savingAct ? (
                      <ActivityIndicator color={colors.primaryForeground} />
                    ) : (
                      <Text
                        style={[
                          styles.modalSaveBtnText,
                          { color: colors.primaryForeground },
                        ]}
                      >
                        Add Activity
                      </Text>
                    )}
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showAddMemory}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddMemory(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAddMemory(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <View
                  style={[
                    styles.modalSheet,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.modalHandle}>
                    <View
                      style={[
                        styles.handleBar,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.modalTitle, { color: colors.foreground }]}
                  >
                    Log Memory
                  </Text>
                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    placeholder="Memory title"
                    placeholderTextColor={colors.mutedForeground}
                    value={memTitle}
                    onChangeText={setMemTitle}
                    autoFocus
                  />
                  <TextInput
                    style={[
                      styles.modalInput,
                      styles.memBodyInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    placeholder="What happened? (optional)"
                    placeholderTextColor={colors.mutedForeground}
                    value={memBody}
                    onChangeText={setMemBody}
                    multiline
                    numberOfLines={3}
                  />
                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    placeholder="Date (YYYY-MM-DD)"
                    placeholderTextColor={colors.mutedForeground}
                    value={memDate}
                    onChangeText={setMemDate}
                  />
                  <View style={styles.moodRow}>
                    {MOODS.map((mood) => (
                      <Pressable
                        key={mood}
                        style={[
                          styles.moodBtn,
                          {
                            backgroundColor:
                              memMood === mood
                                ? colors.primary + "33"
                                : colors.secondary,
                            borderColor:
                              memMood === mood
                                ? colors.primary
                                : colors.border,
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() =>
                          setMemMood(memMood === mood ? "" : mood)
                        }
                      >
                        <Text style={styles.moodBtnText}>
                          {MOOD_EMOJI[mood]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable
                    style={[
                      styles.modalSaveBtn,
                      {
                        backgroundColor:
                          !memTitle.trim() || savingMem
                            ? colors.muted
                            : colors.primary,
                      },
                    ]}
                    onPress={handleAddMemory}
                    disabled={!memTitle.trim() || savingMem}
                  >
                    {savingMem ? (
                      <ActivityIndicator color={colors.primaryForeground} />
                    ) : (
                      <Text
                        style={[
                          styles.modalSaveBtnText,
                          { color: colors.primaryForeground },
                        ]}
                      >
                        Save Memory
                      </Text>
                    )}
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  headerName: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  headerRight: {
    width: 40,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: -1,
  },
  tabLabel: {
    fontSize: 14,
  },
  guideContent: {
    padding: 20,
    gap: 14,
    paddingBottom: 60,
  },
  stageBadge: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  stageName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  stageAge: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  guideDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 23,
  },
  guideSection: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginTop: 6,
  },
  tipRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  tabList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  activityDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  deleteBtn: {
    padding: 4,
    flexShrink: 0,
  },
  memoryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  memoryCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  moodEmoji: {
    fontSize: 16,
  },
  memoryDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  memoryTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  memoryBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalHandle: {
    alignItems: "center",
    marginBottom: 4,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  memBodyInput: {
    height: 80,
    textAlignVertical: "top",
  },
  moodRow: {
    flexDirection: "row",
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  moodBtnText: {
    fontSize: 20,
  },
  modalSaveBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  modalSaveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
