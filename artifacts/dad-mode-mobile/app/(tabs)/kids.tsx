import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useListChildren,
  useCreateChild,
  useDeleteChild,
} from "@workspace/api-client-react";
import type { Child } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const AVATAR_COLORS = [
  "#e8a045",
  "#6baed6",
  "#84cc16",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#3b82f6",
];

function ageString(birthdate: string): string {
  const birth = new Date(birthdate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years === 0) return `${months} mo`;
  if (months === 0) return `${years} yr`;
  return `${years}y ${months}mo`;
}

function ChildListItem({
  child,
  onPress,
  onDelete,
}: {
  child: Child;
  onPress: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const age = ageString(child.birthdate);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.childItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.avatarCircle,
          { backgroundColor: child.avatarColor + "33" },
        ]}
      >
        <Text style={[styles.avatarText, { color: child.avatarColor }]}>
          {child.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.childInfo}>
        <Text style={[styles.childName, { color: colors.foreground }]}>
          {child.name}
        </Text>
        <Text style={[styles.childAge, { color: colors.mutedForeground }]}>
          {age} old
        </Text>
        {child.notes ? (
          <Text
            style={[styles.childNotes, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {child.notes}
          </Text>
        ) : null}
      </View>
      <View style={styles.childActions}>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

export default function Kids() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: children, isLoading, refetch } = useListChildren();
  const { mutateAsync: createChild } = useCreateChild();
  const { mutateAsync: deleteChild } = useDeleteChild();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openAdd = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setName("");
    setBirthdate("");
    setNotes("");
    setColorIdx(Math.floor(Math.random() * AVATAR_COLORS.length));
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!name.trim() || !birthdate.trim()) return;
    setSaving(true);
    try {
      await createChild({
        data: {
          name: name.trim(),
          birthdate: birthdate.trim(),
          avatarColor: AVATAR_COLORS[colorIdx],
          notes: notes.trim() || undefined,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddModal(false);
      refetch();
    } catch (e) {
      Alert.alert("Error", "Could not add kid. Check the birthdate format (YYYY-MM-DD).");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (child: Child) => {
    Alert.alert(
      `Remove ${child.name}?`,
      "This will delete all their activities and memories.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteChild({ id: child.id });
            refetch();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPad + 16,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.pageTitle, { color: colors.primary }]}>Kids</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAdd}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !children?.length ? (
        <View style={styles.empty}>
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}
          >
            <Feather name="users" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No kids yet
          </Text>
          <Text
            style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
          >
            Add a kid to start tracking activities, memories, and growth.
          </Text>
          <Pressable
            style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
            onPress={openAdd}
          >
            <Text
              style={[styles.emptyAddBtnText, { color: colors.primaryForeground }]}
            >
              Add first kid
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: bottomPad + 100 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ChildListItem
              child={item}
              onPress={() => router.push(`/kid/${item.id}`)}
              onDelete={() => confirmDelete(item)}
            />
          )}
        />
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAddModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <View
                  style={[
                    styles.modalSheet,
                    { backgroundColor: colors.card, borderColor: colors.border },
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
                    Add a kid
                  </Text>

                  <View style={styles.colorRow}>
                    {AVATAR_COLORS.map((c, i) => (
                      <Pressable
                        key={c}
                        style={[
                          styles.colorDot,
                          { backgroundColor: c + "44" },
                          i === colorIdx && {
                            borderWidth: 2,
                            borderColor: c,
                          },
                        ]}
                        onPress={() => setColorIdx(i)}
                      >
                        <View
                          style={[
                            styles.colorDotInner,
                            { backgroundColor: c },
                          ]}
                        />
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.modalForm}>
                    <TextInput
                      style={[
                        styles.modalInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.foreground,
                        },
                      ]}
                      placeholder="Name"
                      placeholderTextColor={colors.mutedForeground}
                      value={name}
                      onChangeText={setName}
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
                      placeholder="Birthdate (YYYY-MM-DD)"
                      placeholderTextColor={colors.mutedForeground}
                      value={birthdate}
                      onChangeText={setBirthdate}
                      keyboardType="numbers-and-punctuation"
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
                      placeholder="Notes (optional)"
                      placeholderTextColor={colors.mutedForeground}
                      value={notes}
                      onChangeText={setNotes}
                    />
                  </View>

                  <Pressable
                    style={[
                      styles.modalSaveBtn,
                      {
                        backgroundColor:
                          !name.trim() || !birthdate.trim() || saving
                            ? colors.muted
                            : colors.primary,
                      },
                    ]}
                    onPress={handleAdd}
                    disabled={!name.trim() || !birthdate.trim() || saving}
                  >
                    {saving ? (
                      <ActivityIndicator color={colors.primaryForeground} />
                    ) : (
                      <Text
                        style={[
                          styles.modalSaveBtnText,
                          { color: colors.primaryForeground },
                        ]}
                      >
                        Add Kid
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
  },
  emptyAddBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyAddBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  childInfo: {
    flex: 1,
    gap: 2,
  },
  childName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  childAge: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  childNotes: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  childActions: {
    flexShrink: 0,
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
    gap: 16,
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
  colorRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  modalForm: {
    gap: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
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
