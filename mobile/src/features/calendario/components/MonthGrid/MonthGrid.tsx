import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Pressable, View } from "react-native";

import { CARE_TYPE_META } from "../../utils/careTypes";
import { useMonthTasks } from "../../hooks/useMonthTasks";
import { createStyles } from "./styles";

interface MonthGridProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export default function MonthGrid({ selectedDate, onSelectDate }: MonthGridProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const cells = useMonthTasks();

  return (
    <View style={styles.wrap}>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((d) => (
          <View key={d} style={styles.weekdayCell}>
            <AppText variant="caption" color={theme.colors.textSecondary}>{d}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell) => {
          const selected = cell.date === selectedDate;
          return (
            <Pressable
              key={cell.date}
              style={[
                styles.dayCell,
                selected ? styles.dayCellSelected : null,
              ]}
              onPress={() => onSelectDate(cell.date)}
            >
              <AppText
                variant="caption"
                color={
                  selected
                    ? theme.colors.textOnOverlay
                    : cell.inMonth
                    ? theme.colors.textPrimary
                    : theme.colors.textMuted
                }
              >
                {Number(cell.date.slice(8, 10))}
              </AppText>
              <View style={styles.dotsRow}>
                {cell.types.slice(0, 3).map((t) => (
                  <View
                    key={t}
                    style={[styles.dot, { backgroundColor: CARE_TYPE_META[t].color }]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
