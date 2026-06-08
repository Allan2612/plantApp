import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { View } from "react-native";

import TaskCard from "../TaskCard";
import { useCalendarioStore } from "../../store/calendario.feature.store";
import { formatDayLabel } from "../../utils/dateRange";
import { useCompleteTask } from "../../hooks/useCompleteTask";
import { createStyles } from "./styles";
import type { CareScheduleItem } from "../../types";

interface DayAgendaProps {
  selectedDate: string;
  getPlantNickname: (userPlantId: string) => string;
}

export default function DayAgenda({ selectedDate, getPlantNickname }: DayAgendaProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const tasks = useCalendarioStore((s) => s.tasks);
  const { completeTask, pendingId } = useCompleteTask(getPlantNickname);

  const dayTasks: CareScheduleItem[] = useMemo(
    () =>
      tasks
        .filter((t) => t.scheduledFor.slice(0, 10) === selectedDate)
        .sort((a, b) => a.type.localeCompare(b.type)),
    [tasks, selectedDate],
  );

  return (
    <View style={styles.wrap}>
      <AppText variant="label" style={styles.title}>
        {formatDayLabel(selectedDate)}
      </AppText>
      {dayTasks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="leaf-outline" size={28} color={theme.colors.textSecondary} />
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Sin tareas para este día.
          </AppText>
        </View>
      ) : (
        dayTasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            plantNickname={getPlantNickname(t.userPlantId)}
            onComplete={completeTask}
            disabled={pendingId === t.id}
          />
        ))
      )}
    </View>
  );
}
