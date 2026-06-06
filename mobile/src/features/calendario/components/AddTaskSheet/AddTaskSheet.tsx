import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { useAuthStore } from "@/src/store/auth.store";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { usePlantsStore } from "@/src/store/plants.store";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";

import { createCareTask } from "../../services/calendarApi.service";
import { enqueueAction, saveCachedTasks } from "../../services/calendarOffline.service";
import { scheduleTaskNotification } from "../../services/localNotifications.service";
import { useCalendarioStore } from "../../store/calendario.feature.store";
import { CARE_TYPES, CARE_TYPE_META } from "../../utils/careTypes";
import type { CareTaskType } from "../../types";
import { createStyles } from "./styles";

interface AddTaskSheetProps {
  visible: boolean;
  defaultDate: string;
  onClose: () => void;
}

function pickFirstPlantId(plants: readonly unknown[]): string {
  const first = plants[0];
  if (!first) return "";
  const payload = (first as { userPlant?: Record<string, unknown> })?.userPlant ?? first;
  return ((payload as { id?: string })?.id) ?? "";
}

export default function AddTaskSheet({ visible, defaultDate, onClose }: AddTaskSheetProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.user?.id ?? null;
  const { isConnected } = useNetworkStatus();
  const plants = usePlantsStore((s) => s.plants);
  const tasks = useCalendarioStore((s) => s.tasks);
  const upsertTask = useCalendarioStore((s) => s.upsertTask);

  const [plantId, setPlantId] = useState<string>("");
  const [type, setType] = useState<CareTaskType>("watering");
  const [date, setDate] = useState<string>(defaultDate);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setDate(defaultDate);
      setType("watering");
      setNotes("");
      setPlantId(pickFirstPlantId(plants));
    }
  }, [visible, defaultDate, plants]);

  async function handleSave() {
    if (!userId || !plantId) return;
    setSaving(true);
    try {
      const payload = {
        userId,
        userPlantId: plantId,
        type,
        scheduledFor: date,
        notes: notes.trim() || null,
      };
      if (isConnected === false) {
        const optimisticId = `local-${Date.now()}`;
        upsertTask({
          id: optimisticId,
          userId,
          userPlantId: plantId,
          type,
          status: "pending",
          scheduledFor: date,
          notes: payload.notes,
          ruleId: null,
        });
        await enqueueAction(userId, {
          kind: "create",
          payload: {
            userId,
            userPlantId: plantId,
            type,
            status: "pending",
            scheduledFor: date,
            notes: payload.notes,
            ruleId: null,
          },
        });
      } else {
        const created = await createCareTask(payload);
        upsertTask(created);
        const allTasks = [...tasks, created];
        await saveCachedTasks(userId, allTasks);
        const plant = plants.find((p) => {
          const inner = (p as { userPlant?: Record<string, unknown> })?.userPlant ?? p;
          return (inner as { id?: string })?.id === plantId;
        });
        const inner = (plant as { userPlant?: Record<string, unknown> })?.userPlant ?? plant;
        const nickname = ((inner as { nickname?: string })?.nickname) ?? "Planta";
        await scheduleTaskNotification(created, nickname);
      }
      onClose();
    } catch {
      // noop
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={{ flex: 1 }} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <View style={styles.headerRow}>
            <AppText variant="subheading">Nueva tarea</AppText>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close-outline" size={24} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <AppText variant="label">Tipo</AppText>
          <View style={styles.typeRow}>
            {CARE_TYPES.map((t) => {
              const active = type === t;
              const meta = CARE_TYPE_META[t];
              return (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={[styles.typeChip, active ? { backgroundColor: meta.color } : null]}
                >
                  <Ionicons name={meta.icon} size={16} color={active ? "#fff" : meta.color} />
                  <AppText variant="caption" color={active ? "#fff" : theme.colors.textPrimary}>
                    {meta.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="label" style={styles.label}>Planta</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plantsRow}>
            {plants.map((p) => {
              const inner = (p as { userPlant?: Record<string, unknown> })?.userPlant ?? p;
              const id = ((inner as { id?: string })?.id) ?? "";
              const name = ((inner as { nickname?: string })?.nickname) ?? "Sin nombre";
              const active = plantId === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setPlantId(id)}
                  style={[styles.plantChip, active ? styles.plantChipActive : null]}
                >
                  <AppText variant="caption" color={active ? "#fff" : theme.colors.textPrimary}>
                    {name}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>

          <AppText variant="label" style={styles.label}>Fecha</AppText>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.textPrimary }]}
          />

          <AppText variant="label" style={styles.label}>Notas</AppText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Opcional"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.textPrimary }]}
            multiline
          />

          <AppButton
            title={saving ? "Guardando..." : "Crear tarea"}
            onPress={handleSave}
            disabled={saving || !plantId || !date}
          />
        </View>
      </View>
    </Modal>
  );
}
