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
import { useListChildren, useCreateChild, useDeleteChild, useUpdateChild } from "@workspace/api-client-react";
import type { Child } from "@workspace/api-client-react";
import { C, F, AVATAR_COLORS, GLOW } from "@/constants/theme";

function ageStr(birthdate: string): string {
  const birth = new Date(birthdate);
  const now = new Date();
  let y = now.getFullYear() - birth.getFullYear();
  let m = now.getMonth() - birth.getMonth();
  if (m < 0) { y--; m += 12; }
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y}y ${m}mo`;
}

function KidRow({ child, onPress, onEdit, onDelete }: {
  child: Child;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const col = AVATAR_COLORS.includes(child.avatarColor as typeof AVATAR_COLORS[number])
    ? child.avatarColor : AVATAR_COLORS[0];
  const level = Math.floor(((child as unknown as { memoriesCount?: number }).memoriesCount || 0) / 5) + 1;

  return (
    <Pressable
      style={({ pressed }) => [s.row, { borderColor: col + "77", opacity: pressed ? 0.85 : 1 }]}
      onPress={onPress}
    >
      <View style={[s.avatar, { backgroundColor: col + "22", borderColor: col }]}>
        <Text style={[s.avatarText, { color: col }]}>{child.name[0].toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[s.kidName, { color: C.fg }]}>{child.name}</Text>
        <Text style={[s.kidAge, { color: C.mutedFg }]}>{ageStr(child.birthdate)} old</Text>
        {child.notes ? (
          <Text style={[s.kidNotes, { color: C.mutedFg }]} numberOfLines={1}>{child.notes}</Text>
        ) : null}
      </View>
      <View style={{ alignItems: "flex-end", gap: 8, flexDirection: "row" }}>
        <Text style={[s.kidLevel, { color: C.primary }]}>LVL {level}</Text>
        <Pressable
          onPress={onEdit}
          hitSlop={8}
          style={[s.editBtn, { borderColor: C.border }]}
        >
          <Feather name="edit-2" size={14} color={C.mutedFg} />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Feather name="trash-2" size={15} color={C.mutedFg} />
        </Pressable>
      </View>
    </Pressable>
  );
}

// Shared form fields used in both Add and Edit modals
function KidForm({
  title,
  name, setName,
  birthdate, setBirthdate,
  notes, setNotes,
  colIdx, setColIdx,
  saving,
  onSave,
  saveLabel,
}: {
  title: string;
  name: string; setName: (v: string) => void;
  birthdate: string; setBirthdate: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
  colIdx: number; setColIdx: (i: number) => void;
  saving: boolean;
  onSave: () => void;
  saveLabel: string;
}) {
  return (
    <View style={s.sheet}>
      <View style={s.sheetHandle} />
      <Text style={[s.sheetTitle, GLOW]}>{title}</Text>

      {/* Color picker */}
      <View style={s.colorRow}>
        {AVATAR_COLORS.map((col, i) => (
          <Pressable
            key={col}
            style={[s.colorDot, { backgroundColor: col + "33" }, i === colIdx && { borderColor: col, borderWidth: 2 }]}
            onPress={() => setColIdx(i)}
          >
            <View style={[s.colorInner, { backgroundColor: col }]} />
          </Pressable>
        ))}
      </View>

      {/* Fields */}
      {[
        { label: "NAME", value: name, onChange: setName, placeholder: "Your kid's name", keyboard: "default" as const },
        { label: "BIRTHDATE", value: birthdate, onChange: setBirthdate, placeholder: "YYYY-MM-DD", keyboard: "numbers-and-punctuation" as const },
        { label: "NOTES (OPTIONAL)", value: notes, onChange: setNotes, placeholder: "Any notes...", keyboard: "default" as const },
      ].map((field) => (
        <View key={field.label} style={s.field}>
          <Text style={s.fieldLabel}>{field.label}</Text>
          <TextInput
            style={s.input}
            placeholder={field.placeholder}
            placeholderTextColor={C.mutedFg}
            value={field.value}
            onChangeText={field.onChange}
            keyboardType={field.keyboard}
          />
        </View>
      ))}

      <Pressable
        style={[s.saveBtn, { backgroundColor: !name.trim() || !birthdate.trim() || saving ? C.muted : C.primary }]}
        onPress={onSave}
        disabled={!name.trim() || !birthdate.trim() || saving}
      >
        {saving ? <ActivityIndicator color={C.primaryFg} /> : (
          <Text style={s.saveBtnText}>{saveLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}

export default function Kids() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: children, isLoading, refetch } = useListChildren();
  const { mutateAsync: createChild } = useCreateChild();
  const { mutateAsync: deleteChild } = useDeleteChild();
  const { mutateAsync: updateChild } = useUpdateChild();

  // Add modal state
  const [addModal, setAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addBirthdate, setAddBirthdate] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [addColIdx, setAddColIdx] = useState(0);

  // Edit modal state
  const [editChild, setEditChild] = useState<Child | null>(null);
  const [editName, setEditName] = useState("");
  const [editBirthdate, setEditBirthdate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editColIdx, setEditColIdx] = useState(0);
  const [editSaving, setEditSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openAdd = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddName(""); setAddBirthdate(""); setAddNotes("");
    setAddColIdx(Math.floor(Math.random() * AVATAR_COLORS.length));
    setAddModal(true);
  };

  const openEdit = (child: Child) => {
    setEditName(child.name);
    setEditBirthdate(child.birthdate.split("T")[0]);
    setEditNotes(child.notes || "");
    const idx = AVATAR_COLORS.indexOf(child.avatarColor as typeof AVATAR_COLORS[number]);
    setEditColIdx(idx >= 0 ? idx : 0);
    setEditChild(child);
  };

  const handleAdd = async () => {
    if (!addName.trim() || !addBirthdate.trim()) return;
    setAddSaving(true);
    try {
      await createChild({ data: { name: addName.trim(), birthdate: addBirthdate.trim(), avatarColor: AVATAR_COLORS[addColIdx], notes: addNotes.trim() || undefined } });
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAddModal(false);
      refetch();
    } catch {
      Alert.alert("Error", "Could not add kid. Use YYYY-MM-DD for birthdate.");
    } finally {
      setAddSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editChild || !editName.trim() || !editBirthdate.trim()) return;
    setEditSaving(true);
    try {
      await updateChild({ id: editChild.id, data: { name: editName.trim(), birthdate: editBirthdate.trim(), avatarColor: AVATAR_COLORS[editColIdx], notes: editNotes.trim() || undefined } });
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditChild(null);
      refetch();
    } catch {
      Alert.alert("Error", "Could not update kid. Use YYYY-MM-DD for birthdate.");
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDelete = (child: Child) => {
    Alert.alert(`Remove ${child.name}?`, "This deletes all their activities and memories.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteChild({ id: child.id }); refetch(); } },
    ]);
  };

  return (
    <View style={s.flex}>
      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: topPad + 16 }]}>
        <Text style={[s.pageTitle, GLOW]}>YOUR PARTY</Text>
        <Pressable style={({ pressed }) => [s.addBtn, { opacity: pressed ? 0.8 : 1 }]} onPress={openAdd}>
          <Feather name="plus" size={20} color={C.primaryFg} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>
      ) : !children?.length ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}><Feather name="users" size={36} color={C.primary} /></View>
          <Text style={[s.emptyTitle, GLOW]}>PARTY IS EMPTY</Text>
          <Text style={[s.emptyBody, { color: C.mutedFg }]}>Add a kid to start tracking activities, memories and growth.</Text>
          <Pressable style={({ pressed }) => [s.emptyBtn, { opacity: pressed ? 0.8 : 1 }]} onPress={openAdd}>
            <Feather name="user-plus" size={16} color={C.primaryFg} />
            <Text style={[s.emptyBtnText, { color: C.primaryFg }]}>ADD FIRST KID</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[s.list, { paddingBottom: bottomPad + 100 }]}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
          renderItem={({ item }) => (
            <KidRow
              child={item}
              onPress={() => router.push(`/kid/${item.id}`)}
              onEdit={() => openEdit(item)}
              onDelete={() => confirmDelete(item)}
            />
          )}
        />
      )}

      {/* Add modal */}
      <Modal visible={addModal} animationType="slide" transparent onRequestClose={() => setAddModal(false)}>
        <TouchableWithoutFeedback onPress={() => setAddModal(false)}>
          <View style={s.overlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <KidForm
                  title="ADD A KID"
                  name={addName} setName={setAddName}
                  birthdate={addBirthdate} setBirthdate={setAddBirthdate}
                  notes={addNotes} setNotes={setAddNotes}
                  colIdx={addColIdx} setColIdx={setAddColIdx}
                  saving={addSaving}
                  onSave={handleAdd}
                  saveLabel="SAVE KID"
                />
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit modal */}
      <Modal visible={!!editChild} animationType="slide" transparent onRequestClose={() => setEditChild(null)}>
        <TouchableWithoutFeedback onPress={() => setEditChild(null)}>
          <View style={s.overlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <KidForm
                  title="EDIT KID"
                  name={editName} setName={setEditName}
                  birthdate={editBirthdate} setBirthdate={setEditBirthdate}
                  notes={editNotes} setNotes={setEditNotes}
                  colIdx={editColIdx} setColIdx={setEditColIdx}
                  saving={editSaving}
                  onSave={handleEdit}
                  saveLabel="SAVE CHANGES"
                />
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  pageTitle: { fontFamily: F.title, fontSize: 14, color: C.primary },
  addBtn: { width: 38, height: 38, borderRadius: 2, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 14 },
  emptyIcon: { width: 80, height: 80, borderRadius: 2, borderWidth: 2, borderColor: C.border, backgroundColor: C.card, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontFamily: F.title, fontSize: 11, color: C.fg, textAlign: "center" },
  emptyBody: { fontFamily: F.body, fontSize: 17, textAlign: "center", lineHeight: 24 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 2, marginTop: 8 },
  emptyBtnText: { fontFamily: F.body, fontSize: 16, letterSpacing: 1 },
  list: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 14,
    backgroundColor: C.card, borderWidth: 2, borderRadius: 2,
  },
  editBtn: { width: 28, height: 28, borderRadius: 2, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  avatar: { width: 52, height: 52, borderRadius: 2, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontFamily: F.title, fontSize: 20 },
  kidName: { fontFamily: F.body, fontSize: 19 },
  kidAge: { fontFamily: F.body, fontSize: 16 },
  kidNotes: { fontFamily: F.body, fontSize: 14 },
  kidLevel: { fontFamily: F.body, fontSize: 16 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: C.card, borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2,
    borderColor: C.border, padding: 24, paddingBottom: 40, gap: 16, alignItems: "center",
  },
  sheetHandle: { width: 40, height: 3, backgroundColor: C.border, borderRadius: 2, marginBottom: 8 },
  sheetTitle: { fontFamily: F.title, fontSize: 13, color: C.primary, alignSelf: "flex-start" },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", alignSelf: "flex-start" },
  colorDot: { width: 36, height: 36, borderRadius: 2, alignItems: "center", justifyContent: "center", borderWidth: 0, borderColor: "transparent" },
  colorInner: { width: 18, height: 18, borderRadius: 1 },
  field: { gap: 6, width: "100%" },
  fieldLabel: { fontFamily: F.body, fontSize: 13, color: C.mutedFg, letterSpacing: 1 },
  input: {
    borderWidth: 2, borderColor: C.border, borderRadius: 2,
    backgroundColor: C.bg, color: C.fg, fontFamily: F.body,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 19, width: "100%",
  },
  saveBtn: { borderRadius: 2, paddingVertical: 14, alignItems: "center", width: "100%" },
  saveBtnText: { fontFamily: F.body, fontSize: 18, color: C.primaryFg, letterSpacing: 2 },
});
