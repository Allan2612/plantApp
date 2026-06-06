import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

import {
  createCareRule,
  deleteCareRuleApi,
  fetchCareRules,
  updateCareRule,
} from "../../services/calendarApi.service";
import { useCalendarioStore } from "../../store/calendario.feature.store";
import { CARE_TYPES, CARE_TYPE_META } from "../../utils/careTypes";
import type { CareRule, CareRuleInput, CareTaskType } from "../../types";
import { createStyles } from "./styles";

interface EditRulesSheetProps {
  visible: boolean;
  userPlantId: string;
  onClose: () => void;
}

export default function EditRulesSheet({ visible, userPlantId, onClose }: EditRulesSheetProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const rulesByPlant = useCalendarioStore((s) => s.rulesByPlant);
  const setRulesForPlant = useCalendarioStore((s) => s.setRulesForPlant);
  const rules = useMemo<CareRule[]>(
    () => rulesByPlant[userPlantId] ?? [],
    [rulesByPlant, userPlantId],
  );
  const [loading, setLoading] = useState(false);
  const [draftType, setDraftType] = useState<CareTaskType>("watering");
  const [draftInterval, setDraftInterval] = useState("7");
  const [draftNotes, setDraftNotes] = useState("");

  useEffect(() => {
    if (!visible || !userPlantId) return;
    setLoading(true);
    fetchCareRules(userPlantId)
      .then((r) => setRulesForPlant(userPlantId, r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible, userPlantId, setRulesForPlant]);

  async function addRule() {
    const interval = Number(draftInterval);
    if (!Number.isFinite(interval) || interval < 1) return;
    const input: CareRuleInput = {
      type: draftType,
      intervalDays: Math.min(365, Math.max(1, Math.trunc(interval))),
      notes: draftNotes.trim() || null,
    };
    try {
      const created = await createCareRule(userPlantId, input);
      setRulesForPlant(userPlantId, [...rules, created]);
      setDraftNotes("");
    } catch {}
  }

  async function toggleActive(rule: CareRule) {
    try {
      const updated = await updateCareRule(rule.id, { active: !rule.active });
      setRulesForPlant(
        userPlantId,
        rules.map((r) => (r.id === rule.id ? updated : r)),
      );
    } catch {}
  }

  async function removeRule(rule: CareRule) {
    try {
      await deleteCareRuleApi(rule.id);
      setRulesForPlant(userPlantId, rules.filter((r) => r.id !== rule.id));
    } catch {}
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={{ flex: 1 }} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <View style={styles.headerRow}>
            <AppText variant="subheading">Cuidados programados</AppText>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close-outline" size={24} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <ScrollView style={styles.rulesList} contentContainerStyle={{ gap: theme.spacing.xs }}>
              {rules.length === 0 ? (
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  Sin cuidados activos.
                </AppText>
              ) : (
                rules.map((r) => {
                  const meta = CARE_TYPE_META[r.type];
                  return (
                    <View key={r.id} style={styles.ruleRow}>
                      <View style={[styles.iconBubble, { backgroundColor: meta.color + "22" }]}>
                        <Ionicons name={meta.icon} size={16} color={meta.color} />
                      </View>
                      <View style={styles.ruleBody}>
                        <AppText variant="label">{meta.label} cada {r.intervalDays} días</AppText>
                        {r.notes ? (
                          <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
                            {r.notes}
                          </AppText>
                        ) : null}
                      </View>
                      <Pressable onPress={() => toggleActive(r)} style={styles.actionBtn}>
                        <Ionicons
                          name={r.active ? "pause-outline" : "play-outline"}
                          size={18}
                          color={theme.colors.textPrimary}
                        />
                      </Pressable>
                      <Pressable onPress={() => removeRule(r)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                      </Pressable>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}

          <AppText variant="label" style={styles.sectionLabel}>Añadir cuidado</AppText>
          <View style={styles.typeRow}>
            {CARE_TYPES.map((t) => {
              const active = draftType === t;
              const meta = CARE_TYPE_META[t];
              return (
                <Pressable
                  key={t}
                  onPress={() => setDraftType(t)}
                  style={[styles.typeChip, active ? { backgroundColor: meta.color } : null]}
                >
                  <Ionicons name={meta.icon} size={14} color={active ? "#fff" : meta.color} />
                  <AppText variant="caption" color={active ? "#fff" : theme.colors.textPrimary}>
                    {meta.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.row}>
            <TextInput
              value={draftInterval}
              onChangeText={setDraftInterval}
              keyboardType="number-pad"
              placeholder="Días"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.inputSmall, { color: theme.colors.textPrimary }]}
            />
            <TextInput
              value={draftNotes}
              onChangeText={setDraftNotes}
              placeholder="Notas (opcional)"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.input, { color: theme.colors.textPrimary }]}
            />
          </View>
          <AppButton title="Añadir" onPress={addRule} />
        </View>
      </View>
    </Modal>
  );
}
