import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { CARE_TYPE_META } from "../../utils/careTypes";
import type { CareScheduleItem } from "../../types";
import { createStyles } from "./styles";

interface TaskCardProps {
  task: CareScheduleItem;
  plantNickname: string;
  onComplete: (task: CareScheduleItem) => void;
  onSkip?: (task: CareScheduleItem) => void;
  disabled?: boolean;
}

export default function TaskCard({ task, plantNickname, onComplete, onSkip, disabled }: TaskCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const meta = CARE_TYPE_META[task.type];
  const isDone = task.status === "completed";

  return (
    <View style={[styles.card, isDone ? styles.cardDone : null]}>
      <View style={[styles.iconBubble, { backgroundColor: meta.color + "22" }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.body}>
        <AppText variant="label">{meta.label} · {plantNickname}</AppText>
        {task.notes ? (
          <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
            {task.notes}
          </AppText>
        ) : null}
        <AppText variant="caption" color={isDone ? theme.colors.primary : theme.colors.textMuted}>
          {isDone ? "Completada" : task.status === "skipped" ? "Saltada" : "Pendiente"}
        </AppText>
      </View>
      {task.status === "pending" ? (
        <View style={styles.actions}>
          <Pressable
            onPress={() => onComplete(task)}
            disabled={disabled}
            style={[styles.actionBtn, { backgroundColor: meta.color }]}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
          </Pressable>
          {onSkip ? (
            <Pressable
              onPress={() => onSkip(task)}
              disabled={disabled}
              style={[styles.actionBtn, styles.actionBtnGhost]}
            >
              <Ionicons name="play-skip-forward-outline" size={18} color={theme.colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
