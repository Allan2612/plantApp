import AppText from "@/src/components/shared/AppText/AppText";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

import AddTaskSheet from "../../components/AddTaskSheet";
import DayAgenda from "../../components/DayAgenda";
import MonthGrid from "../../components/MonthGrid";
import { useCalendarioScreen } from "../../hooks/useCalendarioScreen";
import { formatMonthLabel } from "../../utils/dateRange";
import { createStyles } from "./styles";

export default function CalendarioScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const {
    selectedDate,
    setSelectedDate,
    visibleMonth,
    setVisibleMonth,
    getPlantNickname,
  } = useCalendarioScreen();
  const [showAdd, setShowAdd] = useState(false);

  function prevMonth() {
    const m = visibleMonth.month - 1;
    if (m < 0) setVisibleMonth(visibleMonth.year - 1, 11);
    else setVisibleMonth(visibleMonth.year, m);
  }

  function nextMonth() {
    const m = visibleMonth.month + 1;
    if (m > 11) setVisibleMonth(visibleMonth.year + 1, 0);
    else setVisibleMonth(visibleMonth.year, m);
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="subheading">
            {formatMonthLabel(visibleMonth.year, visibleMonth.month)}
          </AppText>
          <TouchableOpacity onPress={nextMonth} hitSlop={12}>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <MonthGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <DayAgenda selectedDate={selectedDate} getPlantNickname={getPlantNickname} />
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
      <AddTaskSheet visible={showAdd} defaultDate={selectedDate} onClose={() => setShowAdd(false)} />
    </ScreenWrapper>
  );
}
