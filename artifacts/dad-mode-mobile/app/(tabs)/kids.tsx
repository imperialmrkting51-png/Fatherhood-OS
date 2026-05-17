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
import { FONTS } from "@/constants/fonts";

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
  if (months < 0) { years--; months += 12; }
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
  const avatarColor = AVATAR_COLORS.includes(child.avatarColor)
    ? child.avatarColor
    : AVATAR_COLORS[0];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.childItem,
        {
          backgroundColor: colors.card,
          borderColor: avatarColor + "66",
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
      onLongPress={onDelete}
    >
      <View style={[styles.avatarSquare, { backgroundColor: avatarColor + "22", borderColor: avatarColor + "88" }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>
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
          <Text style={[styles.childNotes, { color: colors.mutedForeground }]} numberOfLines={1}>
            {child.notes}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
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

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openAdd = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setName(""); setBirthdate(""); setNotes("");
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
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddModal(false);
      refetch();
    } catch {
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
          onPress: async () => { await deleteChild({ id: child.id }); refetch(); },
        },
      ]
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          { paddingTop: topPad + 16, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.pageTitle, { color: colors.primary }]}>KIDS</Text>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={openAdd}
        >
          <Feather name="plus" size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !children?.length ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="users" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            NO KIDS YET
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Add a kid to start tracking activities, memories and growth.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.emptyAddBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={openAdd}
          >
            <Feather name="plus" size={16} color={colors.primaryForeground} />
            <Text style={[styles.emptyAddBtnText, { color: colors.primaryForeground }]}>
              ADD FIRST KID
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
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
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.modalHandleBar, { backgroundColor: colors.border }]} />

                  <Text style={[styles.modalTitle, { color: colors.primary }]}>
                    ADD A KID
                  </Text>

                  <View style={styles.colorRow}>
                    {AVATAR_COLORS.map((c, i) => (
                      <Pressable
                        key={c}
                        style={[
                          styles.colorDot,
                          { backgroundColor: c + "33" },
                          i === colorIdx && { borderWidth: 2, borderColor: c },
                        ]}
                        onPress={() => setColorIdx(i)}
                      >
                        <View style={[styles.colorDotInner, { backgroundColor: c }]} />
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.modalForm}>
                    <View style={styles.fieldGroup}>
                      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>NAME</Text>
                      <TextInput
                        style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: FONTS.pixel }]}
                        placeholder="Your kid's name"
                        placeholderTextColor={colors.mutedForeground}
                        value={name}
                        onChangeText={setName}
                        autoFocus
                      />
                    </View>
                    <View style={styles.fieldGroup}>
                      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>BIRTHDATE</Text>
                      <TextInput
                        style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: FONTS.pixel }]}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.mutedForeground}
                        value={birthdate}
                        onChangeText={setBirthdate}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                    <View style={styles.fieldGroup}>
                      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>NOTES (OPTIONAL)</Text>
                      <TextInput
                        style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: FONTS.pixel }]}
                        placeholder="Any notes..."
                        placeholderTextColor={colors.mutedForeground}
                        value={notes}
                        onChangeText={setNotes}
                      />
                    </View>
                  </View>

                  <Pressable
                    style={[
                      styles.modalSaveBtn,
                      { backgroundColor: !name.trim() || !birthdate.trim() || saving ? colors.muted : colors.primary },
                    ]}
                    onPress={handleAdd}
                    disabled={!name.trim() || !birthdate.trim() || saving}
                  >
                    {saving ? (
                      <ActivityIndicator color={colors.primaryForeground} />
                    ) : (
                      <Text style={[styles.modalSaveBtnText, { color: colors.primaryForeground }]}>
                        SAVE KID
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
    borderBottomWidth: 2,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: FONTS.title,
    letterSpacing: 3,
    textShadowColor: "rgba(232,160,69,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONTS.title,
    letterSpacing: 2,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 17,
    fontFamily: FONTS.pixel,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 2,
    marginTop: 8,
  },
  emptyAddBtnText: {
    fontSize: 15,
    fontFamily: FONTS.pixel,
    letterSpacing: 1,
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
    borderRadius: 2,
    borderWidth: 2,
  },
  avatarSquare: {
    width: 52,
    height: 52,
    borderRadius: 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 22,
    fontFamily: FONTS.title,
  },
  childInfo: { flex: 1, gap: 3 },
  childName: { fontSize: 17, fontFamily: FONTS.pixel },
  childAge: { fontSize: 15, fontFamily: FONTS.pixel },
  childNotes: { fontSize: 14, fontFamily: FONTS.pixel },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    padding: 24,
    paddingBottom: 40,
    gap: 18,
    alignItems: "center",
  },
  modalHandleBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.title,
    letterSpacing: 2,
    textShadowColor: "rgba(232,160,69,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    alignSelf: "flex-start",
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignSelf: "flex-start",
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDotInner: {
    width: 18,
    height: 18,
    borderRadius: 1,
  },
  modalForm: { gap: 12, width: "100%" },
  fieldGroup: { gap: 5 },
  fieldLabel: { fontSize: 13, fontFamily: FONTS.pixel, letterSpacing: 1 },
  modalInput: {
    borderWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    width: "100%",
  },
  modalSaveBtn: {
    borderRadius: 2,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
  },
  modalSaveBtnText: {
    fontSize: 16,
    fontFamily: FONTS.pixel,
    letterSpacing: 2,
  },
});
